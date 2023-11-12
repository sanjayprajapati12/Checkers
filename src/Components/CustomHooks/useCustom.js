import { useState } from 'react';

export default function useCustom(initialValue) {
   const [state, updateState] = useState(initialValue);

   let current = state;

   const get = () => current;

   const set = newValue => {
      current = newValue;
      updateState(newValue);
      return current;
   }

   return {
      get,
      set,
   }
}