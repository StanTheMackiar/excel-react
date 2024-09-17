import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import KeyEnum from '../enum/key.enum';
import {
  isArrowKey,
  isInputKey,
  isSpecialKey,
} from '../helpers/keys/keys.helpers';
import { Direction, useSheetStore } from '../stores/useSheetStore';
import { ICell } from '../types/sheet/cell/cell.types';

export const usePressedKeys = () => {
  const [
    addPressedKey,
    focusedCellInputRef,
    moveLatestSelectedCell,
    moveRemarkedCell,
    pressedKeys,
    remarkedCell,
    remarkedCellInputRef,
    removePressedKey,
    setPressedKeys,
    selectedCells,
    updateCell,
    updateCells,
  ] = useSheetStore(
    useShallow((state) => [
      state.addPressedKey,
      state.focusedCellInputRef,
      state.moveLatestSelectedCell,
      state.moveRemarkedCell,
      state.pressedKeys,
      state.remarkedCell,
      state.remarkedCellInputRef,
      state.removePressedKey,
      state.setPressedKeys,
      state.selectedCells,
      state.updateCell,
      state.updateCells,
    ])
  );

  const focusedElement = focusedCellInputRef?.current;
  const remarkedElement = remarkedCellInputRef?.current;

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

    if (e.key === 'Shift') {
      setPressedKeys([]);

      return;
    }

    removePressedKey(keyCode as KeyEnum);
  };

  useEffect(() => {
    handlePressedKeys();
  }, [pressedKeys]);

  // useEffect(() => {
  //   if (pressedKeys.length > 0) {
  //     setTimeout(() => {
  //       // Forzar limpieza si alguna tecla sigue "pegada"
  //       pressedKeys.forEach((key) => removePressedKey(key));
  //     }, 1000);
  //   }
  // }, [pressedKeys]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyUp, handleKeyDown]);

  return {};
};
