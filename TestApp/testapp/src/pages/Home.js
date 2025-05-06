import { useNavigate, useParams } from 'react-router-dom';

export function HomePage() {
  const { appID } = useParams();
  const navigate = useNavigate();

  const goToCompanyList = () => {
    navigate(`list/company`);
  };

  return (
    <div>
      <h2>Welcome to App {appID}</h2>
      <h3>Home Page</h3>
      <button onClick={goToCompanyList}>
        Go to Company List
      </button>
    </div>
  );
}
