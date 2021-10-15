import test from "ava";
import getHashKey from "./hash-key";

test("HashKey should works correctly", (t) => {
  t.is(getHashKey("/115/1-3/ar,ms"), getHashKey("/115/22")); // both invalid
  t.is(getHashKey("/2/1-3,5,7-9/ar,ms"), getHashKey("/2/2,1,7-9,3,5/ar,ms")); // order not the same
});
