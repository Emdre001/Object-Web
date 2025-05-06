import { useNavigate, useParams } from 'react-router-dom';

export function StartPage() {
  const { appID } = useParams();
  const navigate = useNavigate();

  const goToCompanyList = () => {
    navigate(`list/company`);
  };

  return (
    <div>
      <h2>Welcome to App {appID}</h2>
      <button onClick={goToCompanyList}>
        Go to Company List
      </button>
    </div>
  );
}
