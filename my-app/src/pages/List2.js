// pages/ListPage2.js
import React from 'react';
import { useParams } from 'react-router-dom';
import { MuiList } from '../components/MuiList';
import '../styles/list.css';

export function ListPage2() {
  const { objectType, appID } = useParams();

  return (
    <MuiList
      objectType={objectType}
      appID={appID}
      fetchUrl="http://localhost:5291/api/Object/all"
    />
  );
}
