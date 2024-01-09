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

    description?: string;
    // Display Palestine flag in solidarity
    flagPs?: boolean;
  };
}

export default Configuration;
