export interface DetectorFilesystem {

    hasPath(name: string): Promise<boolean>;
    readFile(name: string): Promise<Buffer>;
    isFile(name: string): Promise<boolean>;
}

export interface FrameworkDetectionItem {
    /**
     * A file path
     * @example "package.json"
     */
    path: string;
    /**
     * A matcher
     * @example "\"(dev)?(d|D)ependencies\":\\s*{[^}]*\"next\":\\s*\".+?\"[^}]*}"
     */
    matchContent?: string;
  }

  /**
   * Framework detection information.
   */
  export interface Framework {
    /**
     * Name of the framework
     * @example "vue"
     */
    name: string;

    useRuntime: string;

    useMode: string[];

    detectors?: {
      /**
       * Collection of detectors that must be matched for the framework
       * to be detected.
       */
      every?: FrameworkDetectionItem[];
      /**
       * Collection of detectors where one match triggers the framework
       * to be detected.
       */
      some?: FrameworkDetectionItem[];
    };

    settings: Record<string, any>;

  }

