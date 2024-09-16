import { RefObject } from 'react';
import { Direction } from '../../stores/useSheetStore';
import { ICell, ICellSpecial, ISheet } from '../../types/sheet/cell/cell.types';
import { alphabet } from '../constants/alphabet';

export const getSheet = (rowsQty: number, colsQty: number): ISheet =>
  Array.from({ length: rowsQty }, (_, positionY) =>
    Array.from({ length: colsQty }, (_, positionX) => {
      const number = positionY + 1;
      const letter = String.fromCharCode(65 + positionX);
      const id = `${letter}${number}`;

      return {
        positionY,
        id,
        letter,
        number,
        positionX,
        value: '',
        computedValue: '',
      };
    })
  );

export const getSheetLetters = (colsQty: number): ICellSpecial[] => {
  return Array.from({ length: colsQty }, (_, i) => ({
    name: alphabet[i],
    value: i,
  }));
};

export const getSheetNumbers = (rowsQty: number): ICellSpecial[] => {
  return Array.from({ length: rowsQty }, (_, i) => ({
    name: String(i + 1),
    value: i,
  }));
};

export const adjustSheetSize = (
  rows: number,
  cols: number,
  currentSheet: ISheet
): ISheet => {
  // Genera una nueva hoja completa
  const newSheet = getSheet(rows, cols);

  // Sobrescribe las celdas de la nueva hoja con las celdas existentes en currentSheet, si las hay
  for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
    for (let colIndex = 0; colIndex < cols; colIndex++) {
      if (currentSheet[rowIndex]?.[colIndex]) {
        newSheet[rowIndex][colIndex] = currentSheet[rowIndex][colIndex];
      }
    }
  }

  return newSheet;
};

export const getCellFromMouseEvent = (e: any, sheet: ISheet): ICell | null => {
  const [cellId] = e.target.id.split('-');

  if (!cellId) return null;

  const cell = sheet.flat().find((cell) => cell.id === cellId) ?? null;

  return cell;
};

export const getCellFromInputRef = (
  inputRef: RefObject<HTMLInputElement> | null,
  sheet: ISheet
): ICell | null => {
  if (!inputRef?.current) return null;

  const [cellId] = inputRef?.current.id.split('-');

  if (!cellId) return null;

  const cell = sheet.flat().find((cell) => cell.id === cellId) ?? null;

  return cell;
};

export const getSelectedCells = (
  startCell: ICell,
  currentCell: ICell,
  sheet: ISheet
) => {
  const newSelectedCells: ICell[] = [];

  const startY = Math.min(startCell.positionY, currentCell.positionY);
  const endY = Math.max(startCell.positionY, currentCell.positionY);
  const startX = Math.min(startCell.positionX, currentCell.positionX);
  const endX = Math.max(startCell.positionX, currentCell.positionX);

  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      const cell = sheet[y][x];
      newSelectedCells.push(cell);
    }
  }

  return newSelectedCells;
};

export const getCellByDirection = (
  dir: Direction,
  cell: ICell,
  sheet: ISheet
): ICell | undefined => {
  const coordsMap: Record<Direction, { x: number; y: number }> = {
    up: {
      x: cell.positionX,
      y: cell.positionY - 1,
    },
    down: {
      x: cell.positionX,
      y: cell.positionY + 1,
    },
    right: {
      x: cell.positionX + 1,
      y: cell.positionY,
    },
    left: {
      x: cell.positionX - 1,
      y: cell.positionY,
    },
  };
  const coords = coordsMap[dir];
  const positionX = Math.max(coords.x, 0);
  const positionY = Math.max(coords.y, 0);

  const newCell = sheet[positionY][positionX];

  return newCell;
};

const cellRegex = /([A-Z]+)(\d+)/g;

export const parseFormula = (formula: string, sheet: ISheet) => {
  const result = formula.replace(cellRegex, (_, col, row) => {
    const colIndex = col.charCodeAt(0) - 'A'.charCodeAt(0);

    const rowIndex = parseInt(row, 10) - 1;

    // Devolver el valor de la celda desde la matriz
    return sheet[rowIndex][colIndex].computedValue;
  });

  return result;
};

export const parseRange = (range: string) => {
  const [start, end] = range.split(':');
  return { start, end };
};

export const computeCell = (cell: ICell, sheet: ISheet, newValue?: string) => {
  const value = newValue ?? cell.value;
  const cellHasFunction = cell.value.startsWith('=');

  let computedValue = cellHasFunction ? value.substring(1) : value;

  if (cellHasFunction && computedValue) {
    try {
      const formula = parseFormula(computedValue, sheet);

      const result = eval(formula);

      const avaiableTypes = ['string', 'number'];
      const resultType = typeof result;

      if (avaiableTypes.includes(resultType)) computedValue = result;
      else throw new Error();
    } catch (error) {
      console.error(error);

      computedValue = '#ERROR';
    }
  }

  return {
    ...cell,
    value,
    computedValue,
  };
};
