import { FC, useCallback, useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';
import {
  getSheetLetters,
  getSheetNumbers,
} from '../../helpers/sheet/sheet.helper';
import { useSheetStore } from '../../stores/useSheetStore';
import { ICell, ICellSpecial } from '../../types/sheet/cell/cell.types';

import clsx from 'clsx';
import { computeCell } from '../../helpers/sheet/cell/cell.helper';
import './Sheet.css';
import { Cell } from './cells/Cell';

export const Sheet: FC = () => {
  const [
    focusedCellInputRef,
    selectedCells,
    setSelectedCells,
    setSheet,
    sheet,
  ] = useSheetStore(
    useShallow((state) => [
      state.focusedCellInputRef,
      state.selectedCells,
      state.setSelectedCells,
      state.setSheet,
      state.sheet,
    ])
  );

  const [rowsQty, colsQty] = useSheetStore(
    useShallow((state) => [state.rowsQty, state.colsQty])
  );

  const focusedElement = focusedCellInputRef?.current;

  const saveSheetFromCell = (cell: ICell, newValue: string) => {
    const newSheet = sheet.map((row) =>
      row.map((sheetCell) => {
        const isTargetCell = sheetCell.id === cell.id;

        return computeCell(
          sheetCell,
          sheet,
          isTargetCell ? newValue : undefined
        );
      })
    );

    setSheet({ sheet: newSheet });
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
