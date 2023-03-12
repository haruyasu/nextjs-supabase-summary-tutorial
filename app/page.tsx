import { Suspense } from 'react'

import PostList from './components/post/post-list'
import Loading from './loading'
import PostNew from './components/post/post-new'

// メインページ
const Page = () => {
  return (
    <div className="h-full">
      <Suspense fallback={<Loading />}>
        {/* @ts-ignore*/}
        <PostList />
      </Suspense>

      <PostNew />
    </div>
  )
}

export default Page
