function dateDuration(startDate, endDate) {
    return dateStatus(dateToSeconds(endDate) - dateToSeconds(startDate));
  }
  
  function dateStatus(seconds) {
    if (seconds > 60 * 60 * 24 * 365.25) {
      return `${secondsToYears(seconds)} Years`;
    } else if (seconds > 60 * 60 * 24 * 30.44) {
      return `${secondsToMonths(seconds)} Month`;
    } else {
      return `${secondsToDays(seconds)} Days`;
    }
  }
  
  function dateToSeconds(date) {
    return Math.floor(new Date(date).getTime() / 1000); // 
  }
  
  function secondsToDays(seconds) {
    const secondsInADay = 86400; 
    return Math.floor(seconds / secondsInADay);
  }
  
  function secondsToMonths(seconds) {
    const secondsInMonth = 60 * 60 * 24 * 30.44;
    return Math.floor(seconds / secondsInMonth);
  }
  
  function secondsToYears(seconds) {
    const secondsInYear = 60 * 60 * 24 * 365.25; 
    return Math.floor(seconds / secondsInYear);
  }

  module.exports=dateDuration;