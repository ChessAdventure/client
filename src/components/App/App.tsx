import { useEffect, useState } from 'react'
import { Switch, Route, Redirect, useHistory } from 'react-router-dom';
import './App.css';
import Computer from '../Computer/Computer'
import Dashboard from '../Dashboard/Dashboard'
import GameScreen from '../GameScreen/GameScreen'
import Header from '../Header/Header'
import Splash from '../Splash/Splash'

const App = () => {

  const [userName, setUserName] = useState<string>('')
  const [userKey, setUserKey] = useState<string>('')
  const [gameId, setGameId] = useState<string>('')
  const [activeGame, setActiveGame] = useState<string>('')
  let history = useHistory()

  useEffect(() => {
    const activeUser = localStorage.getItem('chessAdventureName') || ''
    const activeKey = localStorage.getItem('jwt') || ''
    setUserName(activeUser)
    setUserKey(activeKey)
  }, [])

  useEffect(() => {
    if (gameId !== '') {
      history.push(`/game/${gameId}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId])

  const goToLogin = () => {
    history.push(`/`)
  }

  return (
    <>
      <Switch>
        <Route
          exact
          path="/"
          render={() => { return <Splash setUserName={setUserName} setUserKey={setUserKey} /> }}
        >
          {userKey && <Redirect to={`/dashboard`} />}
        </Route>
        <Route
          exact
          path="/dashboard"
          render={() => {
            return <Dashboard
              user={userName}
              setGameId={setGameId}
              userKey={userKey}
              activeGame={activeGame}
            />
          }}
        >
          {gameId.length && <Redirect to={`/game/${gameId}`} /> && !userKey.length && <Redirect to={`/`} />}
        </Route>
        <Route
          path="/gofishing"
          render={(() => {
            return (
              <>
                <Header />
                <Computer userName={userName} />
              </>)
          })}
        >
        </Route>
        <Route
          path="/game/:id"
          render={({ match }: any) => {
            return userKey.length > 0 ?
              <GameScreen
                setActiveGame={setActiveGame}
                setGameId={setGameId}
                gameId={match.params.id}
                userKey={userKey}
                userName={userName}
              /> :
              <div className="game-loading-screen-container">
                <p>Hang on, we're setting up the game board!</p>
                <p>If you see this screen for more than a few seconds,
                  <br></br>
                  please <button onClick={goToLogin} className="button-lt-bg">click here to log in</button> or refresh the page.</p>
              </div>

          }}
        >
        </Route>
        <Route render={() => {
          return (
            <>
              <Header />
              <div className="game-loading-screen-container">
                <p>That's a move I've never seen before!</p>
                <p>This URL doesn't exist.
                <br></br>
                please double check it or
                <br></br>
                  <button onClick={goToLogin} className="go-to-login button-lt-bg">click here</button>
               to go home.</p>
              </div>
            </>
          )
        }}
        ></Route>
      </Switch>
    </>
  );
}

export default App;
