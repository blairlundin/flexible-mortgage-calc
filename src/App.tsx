import * as React from 'react';
import RepaymentsForm from './components/RepaymentsForm';
import 'bootstrap/dist/css/bootstrap.css';
import { Container } from 'reactstrap';

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Container>
          <header>
            <h1 className="text-center mt-3 mb-5">Mortgage Calculator</h1>
          </header>
          <RepaymentsForm />
        </Container>
      </div>
    );
  }

}

export default App;
