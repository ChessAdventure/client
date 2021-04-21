/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, SetStateAction, useState, useEffect } from 'react'
import Header from '../Header/Header'
import QuestStart from '../QuestStart/QuestStart'
import Rules from '../Rules/Rules'
import Gameboard from '../UIComponents/Gameboard/Gameboard'
import { API_ROOT } from '../../constants/index'
import Thumbnail from '../UIComponents/Thumbnail/Thumbnail'
import './Dashboard.css'

interface PropTypes {
  user: string;
  setGameId: Dispatch<SetStateAction<string>>;
  userKey: string;
}

const Dashboard = ({ user, setGameId, userKey }: PropTypes) => {
  const [lastGame, setLastGame] = useState<string>('')
  const [lastWinner, setLastWinner] = useState<string>('')

  useEffect(() => {
    getLastGame()
  }, [])

  const getLastGame = async () => {
      console.log("here?");
      try {
        const response = await fetch(`${API_ROOT}/api/v1/stats/${user}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors'
        })
        const data = await response.json()
        console.log("look here", data);
        setLastGame(data.data.meta.last_game.fen)
        setLastWinner(data.data.meta.last_game.status)
        
      } catch(e) {
        console.log(e);
      }
    }

  return (
    <>
      <Header />

      <section className="container">
        <div className="greeting">
          <p>Welcome, </p>
          <Thumbnail text={user} />
        </div>
        <Rules />
        <QuestStart setGameId={setGameId} userKey={userKey} />
        <section>
          <h3 className="previous-game-header">Last time you played,
            <span>
              {lastWinner === 'won' ? <span> white was the winner!</span> : <span>black was the winner!</span>}
            </span>
          </h3>
          <Gameboard
            width={300}
            orientation={'white'}
            draggable={false}
            fen={lastGame}
            boardStyle={{
              'width': '300px', 'height': '300px', 'cursor': 'default', 'borderRadius': '5px', 'boxShadow': 'rgba(0, 0, 0, 0.5) 0px 5px 15px'
}}
          />
        </section>
      </section>
    </>
  )
}

export default Dashboard



