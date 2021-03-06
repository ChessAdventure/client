import React, { Dispatch, SetStateAction } from 'react'
import { API_ROOT } from '../../constants/index'

interface PropTypes {
  setGameId: Dispatch<SetStateAction<string>>;
  userKey: string;
}

const QuestStart = ({ setGameId, userKey }: PropTypes) => {

  const handleClick = async () => {
    let token = "Bearer " + localStorage.getItem('jwt')
    try {
      const promise = await fetch(`${API_ROOT}/api/v1/friendly_games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        mode: 'cors',
      })

      const currentGameId = await promise.json()
      setGameId(currentGameId.data.attributes.extension)
    } catch (e) {
      console.log(e);
    }
  }
  return (
    <section className="quest-start" id="quest-start">
      <button className="button-lt-bg start-button" onClick={handleClick}>Start A ChessPedition</button>
    </section>
  )
}

export default QuestStart