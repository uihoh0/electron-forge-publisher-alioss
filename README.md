# POPURSE
    Support using the alioss as the AutoUpdate artifacts source.

### USAGE
    ```ts
        // For publish stage
        // for the electron-forge config [https://www.electronforge.io/config/publishers/s3]
        // just set the config like the publisher S3, then replace the name to electron-forge-publisher-alioss
        // For example
        { 
            // ...other configurations
            "publishers": [
                {
                    "name": "electron-forge-publisher-alioss",
                    config: {
                        accessKeyId?: string,
                        /**
                         * The secret for your Alioss Access Key
                         *
                         * Falls back to the PUBLISHER_ALIOSS_ACCESS_KEY_SECRET environment variable if not provided
                         */
                        accessKeySecret?: string,
                        /**
                         * The region of your alioss
                         * The secret for your Alioss Access REGION
                         *
                         * Falls back to the PUBLISHER_ALIOSS_REGION environment variable if not provided
                         */
                        region?: string,
                        /**
                         * The name of the alioss bucket to upload artifacts to
                         * Falls back to the PUBLISHER_ALIOSS_BUCKET environment variable if not provided
                         */
                        bucket?: string,
                        /**
                         * The baseURL prefix to upload artifacts to.
                         * 
                         * Falls back to the PUBLISHER_ALIOSS_BASE_URL environment variable if not provided
                         * Default: ''
                         */
                        baseURL?: string,
                        /**
                         * The endpoint URI to send requests to.
                         *
                         */
                        endpoint?: string,
                        /**
                         * Custom function to provide the name to upload a given file to
                         */
                        nameResolver?: (fileName: string, platform: string, arch: string, version: string) => string,

                        /**
                         * Create a latest symlink to the files, for feeding latest version.
                         * Set to false to prevent creating symlinks
                         * The final symlink would be: path.join(config.baseURL, config.latestSymLink, `${artifact.platform}_${artifact.arch}`, fileName)
                         * Default: 'latest'
                         */
                        latestSymLink?: string | false
                    }
                    // ...other configurations
                    // "platforms": [
                        // "win32",
                        // "darwin"
                    // ]
                }
            ],
        }
    ```

    ```js
        // For the autoUpdater
        import { app, autoUpdater, Notification } from 'electron';
        import os from 'os'
        import isDev from 'electron-is-dev';
        import isSquirreStartup from 'electron-squirrel-startup'; // pls check for the squirrel document to make sure if you need this

        
        const platform = os.platform()
        const arch = os.arch()
        app.whenReady().then(() => {
            // WARNING: electron-forge-publisher-alioss will use 'latest' as symlink folder by default, but if config.latestSymLink was set to the other target, you should set your feedurl correctly by yourself.
            autoUpdater.setFeedURL({ url: `${CLIENTS_UPDATE_ENDPOINT}/${platform}_${arch}/latest` });
            autoUpdater.on('update-not-available', () => {
                console.log('[autoupdater]::not-available');
            });
            autoUpdater.on('update-not-available', () => {
                console.log('[autoupdater]::not-available');
            });
            autoUpdater.on('update-available', () => {
                console.log('[autoupdater]::available');
            });
            autoUpdater.on('update-downloaded', (_e, relaseNote, releaseName, _releaseDate) => {
                console.log('[autoupdater]::downloaded::%s', releaseName);
            });
            autoUpdater.checkForUpdates();
        })
    ```

### symlinks

##### PS: To prevent creating any symlinks, set the config?.latestSymLink to be false

- publisher-alioss would create symlinks for every artifacts under the `${config.baseURL}/${platform}_${arch}/latest`
- publisher-alioss would create extra symlinks for the artifacts has extname which isn't .nupkg
  - e.g. : file<whateverisit.exe> would create a extra symlinks `${config.baseURL}\latest\${platform}_${arch}\${packageJSON.productName || packageJSON.name}.exe`
  - e.g. : file<whateverisit.zip> would create a extra symlinks `${config.baseURL}\latest\${platform}_${arch}\${packageJSON.productName || packageJSON.name}.zip`
  - e.g. : file<yourApp-full.nupkg> would not create a extra symlinks
  - e.g. : file<REALEASE> would not create a extra symlinks