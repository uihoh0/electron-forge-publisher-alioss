// eslint-disable-next-line import/prefer-default-export
export interface PublisherAliossConfig {
    /**
     * Alioss Access Key ID
     *
     * Falls back to the PUBLISHER_ALIOSS_ACCESS_KEY_ID environment variable if not provided
     */
    accessKeyId?: string;
    /**
     * The secret for your Alioss Access Key
     *
     * Falls back to the PUBLISHER_ALIOSS_ACCESS_KEY_SECRET environment variable if not provided
     */
    accessKeySecret?: string;
    /**
     * The region of your alioss
     * The secret for your Alioss Access Key
     *
     * Falls back to the PUBLISHER_ALIOSS_REGION environment variable if not provided
     */
    region?: string;
    /**
     * The name of the alioss bucket to upload artifacts to
     * Falls back to the PUBLISHER_ALIOSS_BUCKET environment variable if not provided
     */
    bucket?: string;
    /**
     * The baseURL prefix to upload artifacts to.
     * 
     * Falls back to the PUBLISHER_ALIOSS_BASE_URL environment variable if not provided
     * Default: ''
     */
    baseURL?: string;
    /**
     * The endpoint URI to send requests to.
     *
     */
    endpoint?: string;
    /**
     * Custom function to provide the name to upload a given file to
     */
    nameResolver?: (fileName: string, platform: string, arch: string, version: string) => string;

    /**
     * Create a latest symlink to the files, for feeding latest version.
     * Set to false to prevent creating symlinks
     * The final symlink would be: path.join(config.baseURL, config.latestSymLink, `${artifact.platform}_${artifact.arch}`, fileName)
     * Default: 'latest'
     */
    latestSymLink?: string | false
  }
  