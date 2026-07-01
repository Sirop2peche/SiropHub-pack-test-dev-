import React from 'react';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main style={{ paddingTop: 65 }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
