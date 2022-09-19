interface SocialLink {
  /**
   * Show this social link?
   */
  show: boolean;
  /**
   * The URL of the social link
   */
  url: string;
}

interface Configuration {
  /**
   * Features to enable on this instance
   */
  features?: {
    /**
     * Additional features that are not categorized
     */
    additional?: {
      ukraine?: {
        /**
         * Feature enabled?
         */
        enabled?: boolean;
        /**
         * Support text
         */
        supportText?: string;
        /**
         * Support link navigated on interaction
         */
        supportUrl?: string;
      };
    };
  };

  /**
   * Footer configuration (displayed at the bottom of most pages)
   */
  footer?: {
    /**
     * Categories and their respective links
     */
    links?: Array<{
      /**
       * Category name
       */
      sectionName?: string;
      /**
       * Links in this category
       */
      links?: Array<{
        /**
         * Link name
         */
        label?: string;
        /**
         * Link navigated on interaction
         */
        url?: string;
      }>;
    }>;

    /**
     * Social links
     */
    socials?: {
      /**
       * Twitter link
       */
      twitter?: SocialLink;
      /**
       * YouTube link
       */
      youtube?: SocialLink;
      /**
       * Instagram link
       */
      instagram?: SocialLink;
    };

    description?: string;
  };
}

export default Configuration;
