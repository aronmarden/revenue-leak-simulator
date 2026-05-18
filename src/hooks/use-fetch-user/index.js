import { useEffect, useState } from 'react';
import { useUserQuery } from 'nr1';

const useFetchUser = () => {
  const [user, setUser] = useState();
  const { data, error, loading } = useUserQuery();

  useEffect(() => {
    if (data && !loading) {
      const { email, id, name } = data;
      setUser({ email, id, name });
    }
  }, [data, loading]);

  useEffect(() => {
    if (error) console.error('Error fetching user', error);
  }, [error]);

  return { user };
};

export default useFetchUser;
