import debug from 'debug';
import Alioss from 'ali-oss';
import PublisherBase, { PublisherOptions } from '@electron-forge/publisher-base';
import { asyncOra } from '@electron-forge/async-ora';
import path from 'path';

import { PublisherAliossConfig } from './config';

const d = debug('electron-forge:publish:alioss');

type AliossArtifact = {
  packageJSON: PublisherOptions['makeResults'][number]['packageJSON']
  path: string;
  version: string;
  platform: string;
  arch: string;
};
interface Alioss612 extends Alioss{
  // @types/ali-oss@6.0.* doesn't match the type of ali-oss@6.12.*
  putSymlink(name: string, targetName: string, options?: {storageClass?: string,meta: Record<string, any>,headers: Record<string, any>}) : Promise<{
    status: number,
    headers: Record<string, any>
    size: number,
    rt: number
  }>
}

export default class PublisherAlioss extends PublisherBase<PublisherAliossConfig> {
  name = 'alioss';

  async publish({
    makeResults,
  }: PublisherOptions) {
    const { config } = this;
    const artifacts: AliossArtifact[] = [];

    for (const makeResult of makeResults) {
      artifacts.push(...makeResult.artifacts.map((artifact) => ({
        packageJSON: makeResult.packageJSON,
        path: artifact,
        version: makeResult.packageJSON.version,
        platform: makeResult.platform,
        arch: makeResult.arch,
      })));
    }
    const accessKeyId =  config.accessKeyId || process.env.PUBLISHER_ALIOSS_ACCESS_KEY_ID
    const accessKeySecret = config.accessKeySecret || process.env.PUBLISHER_ALIOSS_ACCESS_KEY_SECRET
    const bucket = config.bucket || process.env.PUBLISHER_ALIOSS_BUCKET
    if(!accessKeyId || !accessKeySecret || !bucket){
         throw new Error('accessKeyId, accessKeySecret, bucket must be set')  
    }
    const aliossClient = new Alioss({
      accessKeyId,
      accessKeySecret,
      bucket,
      region: config.region || process.env.PUBLISHER_ALIOSS_REGION,
      endpoint: config.endpoint || undefined,
    }) as Alioss612;
    d('creating alioss client with options:', config);

    let uploaded = 0;
    const details:string[] = [];
    const spinnerText = () => `Uploading Artifacts ${uploaded}/${artifacts.length}\n ${details.join('\t')}`;
    await asyncOra(spinnerText(), async (uploadSpinner) => {
      await Promise.all(artifacts.map(async (artifact, idx) => {
          d('uploading:', artifact.path);
          const name = this.nameGenerater(artifact)
          const basename = path.basename(artifact.path)
          const extname = path.extname(artifact.path)
          await aliossClient.multipartUpload(name, artifact.path, {
            progress: (_e, progress) => {
                const fileSize = progress?.fileSize || 1
                const partSize = progress?.partSize || 0
                const doneCount = progress?.doneParts?.length || 0
                const doneSize = partSize * doneCount
                const p = `${Math.round((doneSize / fileSize) * 100)}%`;
                details[idx] = `<${basename}>: ${p}`
                d(`Upload Progress (${path.basename(artifact.path)}) ${p}`);
                uploadSpinner.text = spinnerText();
            }
          });
          if(config?.latestSymLink !== false){
            const baseURL = config.bucket || process.env.PUBLISHER_ALIOSS_BASE_URL || ''
            if(extname && !['.nupkg'].includes(extname)){
              const latestBaseName = `${artifact.packageJSON.productName || artifact.packageJSON.name}${extname}`
              const latestDownloadLink = path.join(baseURL, config.latestSymLink || 'latest', `${artifact.platform}_${artifact.arch}`, latestBaseName).replace(/\\/g, '\/')
              await aliossClient.putSymlink(latestDownloadLink, name)
            }
            const updatelink = path.join(baseURL, config.latestSymLink || 'latest', `${artifact.platform}_${artifact.arch}`, basename).replace(/\\/g, '\/')
            await aliossClient.putSymlink(updatelink, name)
          }
        uploaded += 1;
        details[idx] = `<${basename}>: 100%`
        uploadSpinner.text = spinnerText();
      }));
    });
  }
  nameGenerater(artifact: AliossArtifact){
      const {config} = this
      if(this.config.nameResolver){
          return this.config.nameResolver(path.basename(artifact.path), artifact.platform, artifact.arch, artifact.version)
      }
      const baseURL = (config.bucket || process.env.PUBLISHER_ALIOSS_BASE_URL || '').replace(/\/*$/, '')
    return `${baseURL}/${artifact.platform}_${artifact.arch}/${artifact.version}/${path.basename(artifact.path)}`
  }
}
