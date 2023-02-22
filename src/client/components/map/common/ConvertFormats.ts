const convert = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
];

export const decToSex = (arg) => {
  const extract = arg.toString().split('.');
  let num = extract[0];
  let pieces = [];
  do {
    pieces.push(convert[num % 60]);
    num = Math.floor(num / 60);
  } while (num > 0);
  pieces = pieces.reverse();
  let rem = extract[1];
  let dec;
  if (rem) {
    rem = parseFloat('.' + rem);
    let x = 0;
    dec = [];
    do {
      x++;
      const res = (rem * 60).toString().split('.');
      dec.push(convert[res[0]]);
      if (res[1]) {
        rem = parseFloat('.' + res[1]);
      } else {
        break;
      }
    } while (x < 3); // work up to 3 decimal places, change for more.
  }
  let myResult = pieces.join('');
  if (dec) {
    myResult += '.' + dec.join('');
  }
  return myResult;
};
