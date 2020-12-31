import React from 'react';

export const Logout: React.FC = () => {
  return <div>a</div>;
};
//   useEffect(() => {
//     logout({
//       update: (store) => {
//         store.writeQuery<MeQuery>({
//           query: MeDocument,
//           data: {
//             __typename: "Query",
//             me: null,
//           },
//         });
//       },
//     }).then(() => {
//       client.resetStore();
//       history.push("/login");
//
//       return <div>Logging out...</div>;
//     });
//   }, [client, history, logout]);
//
//   return <div>Logging out...</div>;
// };
// // let mounted = true;
// // async function callLogout() {
//   try {
//     if (mounted) {
//       await logout({
//         update: (store) => {
//           store.writeQuery<MeQuery>({
//             query: MeDocument,
//             data: {
//               __typename: "Query",
//               me: null,
//             },
//           });
//         },
//       });
//       setAccessToken("");
//       await client!.resetStore();
//     }
//   } catch (err) {
//   } finally {
//     history.push("/login");
//     mounted = false;
//   }
// }
// callLogout();
//
// return () => {
//   mounted = false;
// };
