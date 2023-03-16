import { notFound } from 'next/navigation'
import { createClient } from '../../../utils/supabase-server'
import PostDetail from '../../components/post/post-detail'
type PageProps = {
  params: {
    postId: string
  }
}

// 投稿詳細
const PostDetailPage = async ({ params }: PageProps) => {
  const supabase = createClient()

  // 投稿詳細取得
  const { data: postData } = await supabase
    .from('posts')
    .select('*')
    .eq('id', params.postId)
    .single()

  // 投稿が存在しない場合
  if (!postData) return notFound()

  return <PostDetail post={postData} />
}

export default PostDetailPage
