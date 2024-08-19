import { Cell } from '../../types/cell';
import { alphabet } from '../constants/alphabet';

export const getSheet = (rowsQty: number, colsQty: number): Cell[][] =>
  Array.from({ length: rowsQty }, (_, fatherIndex) =>
    Array.from({ length: colsQty }, (_, childIndex) => {
      const number = fatherIndex + 1;
      const letter = alphabet[childIndex];
      const name = `${letter}${number}`;

      return {
        letter,
        number,
        name,
        value: name,
      };
    })
  );

export const getSheetLetters = (colsQty: number) => {
  return Array.from({ length: colsQty }, (_, i) => alphabet[i]);
};

export const getSheetNumbers = (rowsQty: number) => {
  return Array.from({ length: rowsQty }, (_, i) => i + 1);
};
