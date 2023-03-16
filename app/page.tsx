import { Suspense } from 'react'

import PostNew from './components/post/post-new'
import PostList from './components/post/post-list'
import Loading from './loading'

// メインページ
const Page = () => {
  return (
    <div className="h-full">
      <PostNew />

      <Suspense fallback={<Loading />}>
        {/* @ts-ignore*/}
        <PostList />
      </Suspense>
    </div>
  )
}

export default Page
