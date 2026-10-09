const createErrorFactory = function (name: string){
  return class extends Error {
    constructor(message: string){
      super(message);
      this.name = name;
    }
  };
};

export const ResponseError = createErrorFactory("ResponseError");
