import { FC, useCallback, useEffect, useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';
import {
  getSheetLetters,
  getSheetNumbers,
} from '../../helpers/sheet/sheet.helper';
import { useSheetStore } from '../../stores/useSheetStore';
import {
  FunctionModeCell,
  ICell,
  ICellSpecial,
} from '../../types/sheet/cell/cell.types';

import clsx from 'clsx';
import { getColorFromSequence } from '../../helpers/color.helper';
import {
  computeCell,
  parseExpression,
} from '../../helpers/sheet/cell/cell.helper';
import './Sheet.css';
import { Cell } from './cells/Cell';

export const Sheet: FC = () => {
  const [
    colsQty,
    focusedCellInputRef,
    functionMode,
    rowsQty,
    selectedCells,
    setSelectedCells,
    setFunctionModeCells,
    setSheet,
    sheet,
    recomputeSheet,
  ] = useSheetStore(
    useShallow((state) => [
      state.colsQty,
      state.focusedCellInputRef,
      state.functionMode,
      state.rowsQty,
      state.selectedCells,
      state.setSelectedCells,
      state.setFunctionModeCells,
      state.setSheet,
      state.sheet,
      state.recomputeSheet,
    ])
  );

  const focusedElement = focusedCellInputRef?.current;

  useEffect(() => {
    const focusedValue = focusedElement?.value?.substring(1);

    if (!focusedValue || !functionMode) {
      setFunctionModeCells([]);

      return;
    }

    const { cellsFound } = parseExpression(focusedValue, sheet);

    const functionModeCells: FunctionModeCell[] = cellsFound.map(
      ({ id }, i) => ({
        id,
        color: getColorFromSequence(i),
      })
    );

    setFunctionModeCells(functionModeCells);
  }, [focusedCellInputRef?.current?.value, functionMode]);

  const saveSheetFromCell = (cell: ICell, newValue: string) => {
    const currentSheet = sheet.slice();

    currentSheet[cell.positionY][cell.positionX] = computeCell(
      cell,
      sheet,
      newValue
    );

    setSheet({ sheet: currentSheet });

    setTimeout(recomputeSheet, 50);
  };

  const sheetLetters = useMemo(() => getSheetLetters(colsQty), [colsQty]);
  const sheetNumbers = useMemo(() => getSheetNumbers(rowsQty), [rowsQty]);

  const onClickColumn = (col: ICellSpecial) => {
    const columnsFound: ICell[] = sheet
      .flat()
      .filter((cell) => cell.positionX === col.value)
      .map((cell) => cell);

    setSelectedCells(columnsFound);
  };

  const onClickRow = (row: ICellSpecial) => {
    const rowsFound: ICell[] = sheet
      .flat()
      .filter((cell) => cell.positionY === row.value)
      .map((cell) => cell);

    setSelectedCells(rowsFound);
  };

  const getColIsSelected = useCallback(
    (col: ICellSpecial): boolean => {
      const selectedCellsArray = Array.from(selectedCells);

      const someColSelected = selectedCellsArray.some(
        (selectedCell) => selectedCell.positionX === col.value
      );

      return someColSelected;
    },
    [sheet, selectedCells]
  );

  const getRowIsSelected = useCallback(
    (row: ICellSpecial): boolean => {
      const selectedCellsArray = Array.from(selectedCells);

      const someRowSelected = selectedCellsArray.some(
        (selectedCell) => selectedCell.positionY === row.value
      );

      return someRowSelected;
    },
    [sheet, selectedCells]
  );

  return (
    <table className={clsx('sheet', { 'enable-select': !!focusedElement })}>
      <thead className="sheet-head">
        <tr className="sheet-row">
          <th className="sheet-header-cell"></th>

          {sheetLetters.map((col) => (
            <th
              onClick={() => onClickColumn(col)}
              className={clsx({
                ['sheet-header-cell']: true,
                selected: getColIsSelected(col),
              })}
              key={col.name}
            >
              {col.name}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {sheet.map((row, i) => {
          const specialRow = sheetNumbers[i];

          return (
            <tr className="sheet-row" key={specialRow.value}>
              <td
                onClick={() => onClickRow(specialRow)}
                className={clsx({
                  ['sheet-header-cell']: true,
                  selected: getRowIsSelected(specialRow),
                })}
              >
                {specialRow.name}
              </td>

              {row.map((cell) => {
                return (
                  <Cell
                    key={cell.id}
                    cell={cell}
                    saveChanges={saveSheetFromCell}
                  />
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
