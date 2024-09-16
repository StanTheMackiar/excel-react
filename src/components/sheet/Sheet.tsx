import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import {
  computeCell,
  getCellFromMouseEvent,
  getSheetLetters,
  getSheetNumbers,
} from '../../helpers/sheet/sheet.helper';
import { Direction, useSheetStore } from '../../stores/useSheetStore';
import { ICell, ICellSpecial } from '../../types/sheet/cell/cell.types';

import clsx from 'clsx';
import KeyEnum from '../../enum/key.enum';
import {
  isArrowKey,
  isInputKey,
  isSpecialKey,
} from '../../helpers/keys/keys.helpers';
import './Sheet.css';
import { Cell } from './cells/Cell';

export const Sheet: FC = () => {
  const [
    addCellsToSelection,
    focusedCellInputRef,
    remarkedCellInputRef,
    isSelecting,
    moveRemarkedCell,
    remarkedCell,
    selectedCells,
    setIsSelecting,
    setRemarkedCell,
    setSelectedCells,
    setSheet,
    sheet,
    unmarkSelectedCells,
    updateCells,
    updateCell,
    pressedKeys,
    addPressedKey,
    removePressedKey,
    moveLatestSelectedCell,
    selectCells,
    setLatestSelectedCell,
  ] = useSheetStore(
    useShallow((state) => [
      state.addCellsToSelection,
      state.focusedCellInputRef,
      state.remarkedCellInputRef,
      state.isSelecting,
      state.moveRemarkedCell,
      state.remarkedCell,
      state.selectedCells,
      state.setIsSelecting,
      state.setRemarkedCell,
      state.setSelectedCells,
      state.setSheet,
      state.sheet,
      state.unmarkSelectedCells,
      state.updateCells,
      state.updateCell,
      state.pressedKeys,
      state.addPressedKey,
      state.removePressedKey,
      state.moveLatestSelectedCell,
      state.selectCells,
      state.setLatestSelectedCell,
    ])
  );

  const [rowsQty, colsQty] = useSheetStore(
    useShallow((state) => [state.rowsQty, state.colsQty])
  );

  const [startSelectionCell, setStartSelectionCell] = useState<ICell | null>(
    null
  );

  const focusedElement = focusedCellInputRef?.current;
  const remarkedElement = remarkedCellInputRef?.current;

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

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;

    const cell = getCellFromMouseEvent(e, sheet);

    if (!cell) {
      setLatestSelectedCell(null);
      setRemarkedCell(null);
      unmarkSelectedCells();

      return;
    }

    const isUniqueSelected = selectedCells.length === 1;

    if (isUniqueSelected && remarkedCell?.id === cell?.id) {
      setIsSelecting(true);

      return;
    }

    if (!isSelecting) {
      setIsSelecting(true);
      setRemarkedCell(cell);
      setSelectedCells([cell]);
      setLatestSelectedCell(null);
      setStartSelectionCell(cell);

      return;
    }

    addCellsToSelection(cell);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isSelecting || !startSelectionCell) return;

    const currentCell = getCellFromMouseEvent(e, sheet);

    if (currentCell) selectCells(startSelectionCell, currentCell);
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
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

  const onPressEnter = () => {
    if (focusedElement) {
      moveRemarkedCell('down');

      return;
    } else if (remarkedElement) {
      remarkedElement.focus();
    }
  };

  const onPressTab = () => {
    moveRemarkedCell('right');
  };

  const onPressShiftPlusTab = () => {
    moveRemarkedCell('left');
  };

  const onPressShiftPlusArrow = (direction: Direction) => {
    if (!focusedElement) {
      moveLatestSelectedCell(direction);
    }
  };

  const onPressBackspace = () => {
    if (!focusedElement) {
      const selectedCellsCleaned: ICell[] = selectedCells.map(
        (selectedCell) => ({ ...selectedCell, value: '', computedValue: '' })
      );

      updateCells(selectedCellsCleaned);
    }
  };

  const onPressArrow = (direction: Direction) => {
    if (!focusedElement) {
      moveRemarkedCell(direction);
    }
  };

  const getActionByKeyPressed = (): VoidFunction | undefined => {
    const pressedKeysValue = pressedKeys
      .map((key) => key.toUpperCase())
      .join('plus');

    const keyMap: Record<string, VoidFunction | undefined> = {
      ENTER: () => onPressEnter(),
      BACKSPACE: () => onPressBackspace(),
      DELETE: () => onPressBackspace(),
      TAB: () => onPressTab(),
      SHIFTplusTAB: () => onPressShiftPlusTab(),
      ARROWRIGHT: () => onPressArrow('right'),
      ARROWLEFT: () => onPressArrow('left'),
      ARROWDOWN: () => onPressArrow('down'),
      ARROWUP: () => onPressArrow('up'),

      SHIFTplusARROWUP: () => onPressShiftPlusArrow('up'),
      SHIFTplusARROWDOWN: () => onPressShiftPlusArrow('down'),
      SHIFTplusARROWLEFT: () => onPressShiftPlusArrow('left'),
      SHIFTplusARROWRIGHT: () => onPressShiftPlusArrow('right'),
    };

    return keyMap[pressedKeysValue];
  };

  const handlePressedKeys = () => {
    if (!pressedKeys.length) return;

    const keyAction = getActionByKeyPressed();

    if (keyAction) return keyAction();

    const inputKeyPressed = pressedKeys.find((key) => isInputKey(key));

    const updateRemarkedCell =
      inputKeyPressed &&
      !focusedElement &&
      typeof remarkedElement?.value !== 'undefined';

    if (updateRemarkedCell && remarkedCell) {
      updateCell(remarkedCell?.id, {
        value: inputKeyPressed,
        computedValue: inputKeyPressed,
      });

      setTimeout(() => remarkedElement.focus(), 50);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const keyCode = e.key;

    const isArrow = isArrowKey(keyCode);
    const isSpecial = isSpecialKey(keyCode);

    const allowDefaultEvent = !isSpecial || (focusedElement && isArrow);

    if (!allowDefaultEvent) e.preventDefault();

    addPressedKey(keyCode as KeyEnum);
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    const keyCode = e.key;

    removePressedKey(keyCode as KeyEnum);
  };

  useEffect(() => {
    handlePressedKeys();
  }, [pressedKeys]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    handleMouseMove,
    handleMouseUp,
    handleMouseDown,
    handleKeyUp,
    handleKeyDown,
  ]);

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
