import * as util from "util";

export default function (variable) {
  return console.log(util.inspect(variable, false, null, false));
}
