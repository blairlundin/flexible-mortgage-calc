import RepaymentsForm from './components/RepaymentsForm';
import 'bootstrap/dist/css/bootstrap.css';
import { Container } from 'reactstrap';

function App() {
  return (
    <Container>
      <header>
        <h1 className="text-center mt-3 mb-5">Mortgage Calculator</h1>
      </header>
      <RepaymentsForm />
    </Container>
  );
}

export default App;
