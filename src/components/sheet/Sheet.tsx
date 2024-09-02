import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import {
  getCellFromMouseEvent,
  getSheetLetters,
  getSheetNumbers,
} from '../../helpers/sheet/sheet.helper';
import { SelectedCellsInternalState, useSheetStore } from '../../stores/useSheetStore';
import {
  CellOnKeyDownParams,
  ICell,
  ICellSpecial,
} from '../../types/sheet/cell/cell.types';

import clsx from 'clsx';
import { isInputKey, isSpecialKey } from '../../helpers/keys/keys.helpers';
import { ActionByKeyPressedParams } from '../../types/sheet/sheet.types';
import './Sheet.css';
import { Cell } from './cells/Cell';

export const Sheet: FC = () => {
  const [
    addCellsToSelection,
    focusedCellInput,
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
    updateCell,
    updateCells,
    pressedKeys
  ] = useSheetStore(
    useShallow((state) => [
      state.addCellsToSelection,
      state.focusedCellInput,
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
      state.updateCell,
      state.updateCells,
      state.pressedKeys
    ])
  );

  const [rowsQty, colsQty] = useSheetStore(
    useShallow((state) => [state.rowsQty, state.colsQty])
  );

  const [startSelectionCell, setStartSelectionCell] = useState<ICell | null>(
    null
  );

  const saveSheetFromCell = (cell: ICell, value: string) => {
    const newSheet = sheet.map((row) =>
      row.map((sheetCell) => {
        if (sheetCell.id === cell.id) {
          const cellHasFunction = value.startsWith('=')

          let computedValue = value

          if(cellHasFunction) {
            try {
              const result = eval(value.substring(1))

              const avaiableTypes = ["string", "number"]
              const resultType = typeof result

              if(avaiableTypes.includes(resultType)) computedValue = result
              else throw new Error()

            } catch (error) {
              console.error(error)

              computedValue = '#ERROR'
            }
          }

          return {
            ...sheetCell,
            value,
            computedValue,
          };
        } else return sheetCell;
      })
    );

    setSheet({ sheet: newSheet });
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;

    const cell = getCellFromMouseEvent(e, sheet);

    if (!cell) {
      setRemarkedCell(null);
      unmarkSelectedCells();

      return;
    }

    const isUniqueSelected = selectedCells.size === 1;

    if (isUniqueSelected && remarkedCell?.id === cell?.id) {
      setIsSelecting(true);

      return;
    }

    if (!isSelecting) {
      setIsSelecting(true);
      setRemarkedCell(cell);
      setSelectedCells(new Set([{cell}]));
      setStartSelectionCell(cell);

      return;
    }

    addCellsToSelection(cell);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isSelecting || !startSelectionCell) return;

    const startCell = startSelectionCell;
    const currentCell = getCellFromMouseEvent(e, sheet);

    if (!currentCell) return;

    const newSelectedCells = new Set<SelectedCellsInternalState>();

    const startY = Math.min(startCell.positionY, currentCell.positionY);
    const endY = Math.max(startCell.positionY, currentCell.positionY);
    const startX = Math.min(startCell.positionX, currentCell.positionX);
    const endX = Math.max(startCell.positionX, currentCell.positionX);

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const cell = sheet[y][x];
        newSelectedCells.add({cell});
      }
    }

    setSelectedCells(newSelectedCells);
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [handleMouseMove, handleMouseUp, handleMouseDown]);

  const sheetLetters = useMemo(() => getSheetLetters(colsQty), [colsQty]);
  const sheetNumbers = useMemo(() => getSheetNumbers(rowsQty), [rowsQty]);

  const onClickColumn = (col: ICellSpecial) => {
    const columnsFound: SelectedCellsInternalState[] = sheet
      .flat()
      .filter((cell) => cell.positionX === col.value).map(cell => ({cell}));

    setSelectedCells(new Set(columnsFound));
  };

  const onClickRow = (row: ICellSpecial) => {
    const rowsFound: SelectedCellsInternalState[] = sheet
      .flat()
      .filter((cell) => cell.positionY === row.value).map(cell => ({cell}));

    setSelectedCells(new Set(rowsFound));
  };

  const getColIsSelected = useCallback(
    (col: ICellSpecial): boolean => {
      const selectedCellsArray = Array.from(selectedCells);

      const someColSelected = selectedCellsArray.some(
        (selectedCellState) => selectedCellState.cell.positionX === col.value
      );

      return someColSelected;
    },
    [sheet, selectedCells]
  );

  const getRowIsSelected = useCallback(
    (row: ICellSpecial): boolean => {
      const selectedCellsArray = Array.from(selectedCells);

      const someRowSelected = selectedCellsArray.some(
        (selectedCellState) => selectedCellState.cell.positionY === row.value
      );

      return someRowSelected;
    },
    [sheet, selectedCells]
  );

  const onPressEnter = ({
    focus,
    saveChanges,
    inputRef,
  }: ActionByKeyPressedParams) => {
    if (focus) {
      saveChanges();
      moveRemarkedCell('down');
    } else {
      inputRef.current?.focus();
    }
  };

  const onPressTab = ({ saveChanges }: ActionByKeyPressedParams) => {
    saveChanges();
    moveRemarkedCell('right');
  };

  const onPressShiftPlusTab = ({ saveChanges }: ActionByKeyPressedParams) => {
    saveChanges();
    moveRemarkedCell('left');
  };

  const onPressBackspace = ({
    cell,
    focus,
    setInternalInput,
  }: ActionByKeyPressedParams) => {
    if (!focus) {
      setInternalInput('');
      updateCell(cell.id, { value: '', computedValue: '' });
      
      const selectedCellsCleaned: ICell[] = Array.from(selectedCells).map(cellState => ({...cellState.cell, value: '', computedValue: ''}))

      updateCells(selectedCellsCleaned)
    }
  };

  const getActionByKeyPressed = (
    params: ActionByKeyPressedParams
  ): VoidFunction | undefined => {


    const keyMap: Record<string, VoidFunction | undefined> = {
      Enter: () => onPressEnter(params),
      Backspace: () => onPressBackspace(params),
      Delete: () => onPressBackspace(params),
      Tab: () => onPressTab(params),
      TabPlusShift: () => onPressShiftPlusTab(params),
      ArrowRight: () => moveRemarkedCell('right'),
      ArrowLeft: () => moveRemarkedCell('left'),
      ArrowDown: () => moveRemarkedCell('down'),
      ArrowUp: () => moveRemarkedCell('up'),
    };

    return keyMap[params.keyCode];
  };

  const onPressKeyFromCell = ({
    cell,
    event,
    inputFocused,
    saveChanges,
    inputRef,
    setInternalInput,
  }: CellOnKeyDownParams) => {
    if (!inputRef.current)
      throw new Error(`No se encontró la ref del input ${cell.id}`);

    const keyCode = event.key;

    const specialKeyPressed = isSpecialKey(keyCode);
    const inputKeyPressed = isInputKey(keyCode);

    if (specialKeyPressed) event.preventDefault();

    const keyAction = getActionByKeyPressed({
      cell,
      keyCode,
      inputRef,
      focus: inputFocused,
      saveChanges,
      setInternalInput,
    });

    if (keyAction) return keyAction();

    if (inputKeyPressed && !inputFocused) {
      setInternalInput('');
      inputRef.current.focus();
    }
  };

  return (
    <table className={clsx('sheet', { 'enable-select': !!focusedCellInput })}>
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
                    onPressKeyFromCell={onPressKeyFromCell}
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
