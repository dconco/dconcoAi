const instructions: string[] = [];

/*  INTRODUCTION  */
instructions[0] = require('./introduction').default;

/*  STYLE  */
instructions[1] = require('./styles').default;

/*  KNOWLEDGE  */
instructions[2] = require('./knowledge').default;

/*  LIMITATIONS  */
instructions[3] = require('./limitations').default;

/*  REMEMBER  */
instructions[4] = require('./remember').default;

export default instructions;