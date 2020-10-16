function letterToNum(letter) {
  console.log("letterToNum", letter, typeof letter);
  return letter.toLowerCase().charCodeAt(0) - 97 + 1;
}

function numToLetter(num) {
  console.log("numToLetter", num, typeof num);
  return String.fromCharCode(97 + num).toUpperCase();
}

module.exports = {
  numToLetter, letterToNum
}