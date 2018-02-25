import * as React from 'react';
import RepaymentsForm from './components/RepaymentsForm';
import './App.css';

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Mortgage Calculator</h1>
        </header>
        <RepaymentsForm />
      </div>
    );
  }

}

export default App;
