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

interface TicketProduct {
  name: string;
  priceId: string;
  price: string;
  grant: number;
  goodDeal: boolean;
  previousPrice?: string;
}

interface Configuration {
  /**
   * Features to enable on this instance
   */
  features?: {
    /**
     * Stripe integration
     */
    stripe?: {
      /**
       * Ticket products
       */
      tickets?: Array<TicketProduct>;
      /**
       * Premium products
       * Values are corresponding price ID
       */
      premium?: {
        bronze?: string;
        silver?: string;
        gold?: string;
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
