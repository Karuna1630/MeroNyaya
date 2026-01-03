import { useDispatch, useSelector } from 'react-redux';

// Custom hooks for using Redux dispatch and selector
//useDispatch hook to dispatch actions to the Redux store
//useSelector hook to access the Redux store's state
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;