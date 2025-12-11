// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabaseClient";
// import type { User } from "@supabase/supabase-js";

// export default function useUser() {
//   const [user, setUser] = useState<User | null>(null);

//   useEffect(() => {
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null);
//     });

//     return () => {
//       subscription.unsubscribe();
//     };
//   }, []);

//   return user;
// }


// hooks/useUser.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

export default function useUser() {
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = loading

  useEffect(() => {
    // check current session first
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    // subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // unsubscribe safely
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  return user;
}