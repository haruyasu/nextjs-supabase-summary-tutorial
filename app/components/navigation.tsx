'use client'

import Link from 'next/link'

// ナビゲーション
const Navigation = () => {
  return (
    <header className="border-b py-5">
      <div className="container max-w-screen-md mx-auto relative flex justify-center items-center">
        <Link href="/" className="font-bold text-xl cursor-pointer">
          FullStackChannel
        </Link>
      </div>
    </header>
  )
}

export default Navigation
