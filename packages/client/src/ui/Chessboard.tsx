import { useMemo, useState, useRef, useEffect } from "react";
import { useDrop, useDrag } from "ahooks";

import { convertToPos, convertToIndex } from "../lib/ulits";

import { Progress, Tooltip } from "antd";

import "./Chessboard.css";
import { boardInterface } from "./ChessMain";

import useChessboard from "@/hooks/useChessboard";

interface ListType extends boardInterface {
  curHealth?: number;
  creature?: number;
  attack: number;
  defense: number;
  health: number;
  movement: number;
  range: number;
  speed: number;
  tier: number;
  x: number;
  y: number;
  creatureId: string;
}

const DragItem = ({ data, children }) => {
  const dragRef = useRef(null);

  useDrag(data, dragRef, {
    onDragStart: () => {},
    onDragEnd: () => {},
  });
  return <div ref={dragRef}>{children}</div>;
};

const Chessboard = () => {
  const {
    PiecesList,
    srcObj,
    BattlePieceList,
    placeToBoard,
    changeHeroCoordinate,
  } = useChessboard();

  const dropRef = useRef(null);

  useDrop(dropRef, {
    onDom: (content: any, e) => {
      const index = (e as any).srcElement.dataset.index;
      const [x, y] = convertToPos(index);
      // console.log(content, "content");

      if (content?.index >= 0) {
        placeToBoard(content.index, x, y);
      } else {
        // const moveIndex = PiecesList?.findIndex(item => item.creatureId == content.creatureId)
        changeHeroCoordinate(content._index!, x, y);
      }
    },
  });

  const squares = useMemo(() => {
    const newSquares = Array(64).fill(null);
    if (BattlePieceList?.length) {
      BattlePieceList?.map((item) => {
        const position = convertToIndex(item.x, item.y);
        newSquares[position] = {
          ...item,
        };
      });
    } else {
      PiecesList?.map((item) => {
        const position = convertToIndex(item.x, item.y);
        newSquares[position] = {
          ...item,
        };
      });
    }
    return newSquares;
  }, [PiecesList, BattlePieceList]);

  const renderSquare = (i) => {
    const [x] = convertToPos(i);
    const className =
      x < 4
        ? "bg-slate-50" // left
        : "bg-green-200"; // right

    const percent =
      squares[i] &&
      Number(
        squares[i]?.["health"] /
          (squares[i]?.["maxHealth"] || squares[i]?.["health"])
      ) * 100;
    let src = "";
    let strokeColor = "";
    if (squares[i]) {
      src = squares[i]["image"];
      strokeColor = squares[i]["enemy"] ? "#ff4d4f" : "#4096ff";
    }
    // console.log(squares[i]);

    const showHP =
      BattlePieceList?.length > 0
        ? `HP ${squares[i]?.["health"]}`
        : `HP ${squares[i]?.["maxHealth"]}`;

    return (
      <div key={i} className={`${className} square`} data-index={i}>
        {squares[i] && percent ? (
          <DragItem key={i} data={squares[i]}>
            <Tooltip title={showHP}>
              <div className="relative">
                <div className=" absolute  -top-5 -left-1">
                  <Progress
                    status="active"
                    showInfo={false}
                    percent={percent}
                    steps={5}
                    strokeColor={strokeColor}
                  />
                </div>
                <img
                  src={src}
                  data-index={i}
                  alt={squares[i]["creatureId"]}
                  style={{ width: 80 }}
                />
                <div className="flex items-center justify-center ">
                  <div className="text-yellow-400  text-sm absolute top-0 -left-0">
                    {Array(squares[i]["tier"])
                      .fill(null)
                      ?.map((item, index) => (
                        <span className="" key={index}>
                          &#9733;
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </Tooltip>
          </DragItem>
        ) : null}
      </div>
    );
  };

  const renderBoard = useMemo(() => {
    const board = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        board.push(renderSquare(i * 8 + j));
      }
    }

    return board;
  }, [squares]);

  return (
    <div className="board" ref={dropRef}>
      {renderBoard}
    </div>
  );
};

export default Chessboard;
