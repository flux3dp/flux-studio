define(function() {
  'use strict';

  return function (currVer, promoteVer) {
      currVer = currVer || "0.0.0";
      promoteVer = promoteVer || "0.0.0";
      if (currVer === promoteVer) return false;
      let currVerArr = currVer.split(".");
      let promoteVerArr = promoteVer.split(".");
      let len = Math.max(currVerArr.length, promoteVerArr.length);
      for (let i = 0; i < len; i++) {
          let proVal = promoteVerArr[i],
              curVal = currVerArr[i];
          if (proVal < curVal) {
              return false;
          } else if (proVal > curVal) {
              return true;
          }
      }
      return false;
    };
})
