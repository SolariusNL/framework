type ConditionalConfig = {
  [key: string]: {
    [condition: string]: {
      pop: string[];
    };
  };
};

export const Objects = {
  applyConditional<T extends Record<string, any>>(
    input: T,
    config: ConditionalConfig
  ): T {
    for (const property in config) {
      const condition = Object.keys(config[property])[0];

      if (condition && input[property] === JSON.parse(condition)) {
        const propertiesToPop = config[property][condition].pop;

        if (propertiesToPop) {
          const result = { ...input };

          for (const prop of propertiesToPop) {
            delete result[prop];
          }

          return result;
        }
      }
    }

    return input;
  },
};
