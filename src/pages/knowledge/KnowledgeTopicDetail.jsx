import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare,
  User,
  Calendar,
  Eye,
  Heart,
  Share2,
  Reply,
  Pin,
  Lock,
  ChevronRight,
  ArrowLeft,
  Flag,
  MoreVertical,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { webRoutes } from '../../lib/webRoutes';
import { knowledgeForumTopicService, knowledgeForumPostService } from '../../api-services/oilgas';
import RichTextEditor from '../../components/RichTextEditor';
import MoreOptions from '../../components/MoreOptions';
import { toast } from 'sonner';
import { useAuth } from '../../context/userContext';
import { confirmDialog } from '../../lib/confirm.jsx';

const KnowledgeTopicDetail = () => {
  const { slug, postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [topicState, setTopic] = useState(null);
  const [posts, setPosts] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [replyingToPost, setReplyingToPost] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [nestedReplies, setNestedReplies] = useState({});
  const [likedPosts, setLikedPosts] = useState(new Set()); // Track liked posts
  const [topicLiked, setTopicLiked] = useState(false); // Track if topic is liked
  const [topicLikes, setTopicLikes] = useState(0); // Track topic likes count
  const [isDeleting, setIsDeleting] = useState(false);

  const pageSize = 20;

  const topicQuery = useQuery({
    queryKey: ['knowledge', 'topic', slug],
    queryFn: async () => {
      const response = await knowledgeForumTopicService.getById(slug);
      return response?.data || response;
    },
    enabled: Boolean(slug),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  const postsQuery = useQuery({
    queryKey: ['knowledge', 'topic', slug, 'posts', currentPage],
    queryFn: async () => {
      const response = await knowledgeForumTopicService.getPosts(slug, {
        page: currentPage,
        page_size: pageSize,
        ordering: 'created_at'
      });
      const data = response?.data || response;
      return { results: data?.results || [], total: data?.total || 0 };
    },
    enabled: Boolean(slug),
    staleTime: 45 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  const threadQuery = useQuery({
    queryKey: ['knowledge', 'forum-post', postId, 'thread'],
    queryFn: async () => {
      const response = await knowledgeForumPostService.getThread(postId);
      return response?.data || response;
    },
    enabled: Boolean(postId),
    staleTime: 45 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  const topic = topicState || topicQuery.data || null;
  const loading = topicQuery.isLoading && !topic;
  const postsLoading = postsQuery.isLoading && posts.length === 0;
  const isCreator = user?.id && topic?.author?.id === user.id;

  useEffect(() => {
    if (!topicQuery.data) return;
    setTopic(topicQuery.data);
    setTopicLiked(topicQuery.data.is_liked || false);
    setTopicLikes(topicQuery.data.likes_count || 0);
  }, [topicQuery.data]);

  useEffect(() => {
    if (!postsQuery.data) return;
    setPosts(postsQuery.data.results);
    setTotalPosts(postsQuery.data.total);
    const likedPostIds = postsQuery.data.results.filter(post => post.is_liked).map(post => post.id);
    setLikedPosts(previous => new Set([...previous, ...likedPostIds]));
  }, [postsQuery.data]);

  useEffect(() => {
    if (topicQuery.isError) {
      toast.error('Failed to load topic');
      navigate(webRoutes.knowledgeForums);
    }
  }, [navigate, topicQuery.isError]);

  const handleDelete = async () => {
    const confirmed = await confirmDialog({
      title: 'Delete topic',
      message: 'Are you sure you want to delete this topic? This action cannot be undone.',
      confirmLabel: 'Delete',
    });
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      const result = await knowledgeForumTopicService.delete(slug);
      if (result === null) return;
      toast.success('Topic deleted');
      navigate(
        topic?.forum?.slug
          ? `/knowledge/forums/${topic.forum.slug}`
          : webRoutes.knowledgeTopics
      );
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete topic');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLikeTopic = async () => {
    try {
      setTopicLiked(!topicLiked);
      const response = await knowledgeForumTopicService.like(slug);
      const data = response?.data || response;
      
      setTopicLiked(data.liked);
      setTopicLikes(data.likes);
      
    } catch (error) {
      console.error('Error liking topic:', error);
      toast.error('Failed to like topic');
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setSubmittingReply(true);
    try {
      const postData = {
        content: replyContent,
        topic: topic.id,
        ...(replyingToPost && { parent: replyingToPost.id })
      };

      await knowledgeForumPostService.create(postData);
      toast.success('Reply posted successfully!');
      setReplyContent('');
      setShowReplyForm(false);
      setReplyingToPost(null);
      await queryClient.invalidateQueries({
        queryKey: ['knowledge', 'topic', slug],
        exact: true,
      });
      await postsQuery.refetch();
      if (postId) {
        await queryClient.invalidateQueries({
          queryKey: ['knowledge', 'forum-post', postId],
          exact: true,
        });
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleReplyToPost = (post) => {
    setReplyingToPost(post);
    setShowReplyForm(true);
    setReplyContent('');
  };

  const handleLikePost = async (postId) => {
    try {
      setLikedPosts(prev => {
        const newLikedPosts = new Set(prev);
        if (!likedPosts.has(postId)) {
          newLikedPosts.add(postId);
        } else {
          newLikedPosts.delete(postId);
        }
        return newLikedPosts;
      });
      const response = await knowledgeForumPostService.like(postId);
      const data = response?.data || response;
      
      // Update the liked posts state
      setLikedPosts(prev => {
        const newLikedPosts = new Set(prev);
        if (data.liked) {
          newLikedPosts.add(postId);
        } else {
          newLikedPosts.delete(postId);
        }
        return newLikedPosts;
      });
      
      // Update the posts state with new like count
      setPosts(prevPosts => prevPosts.map(post => 
        post.id === postId 
          ? { ...post, likes: data.likes || post.likes }
          : post
      ));
      
      // Update nested replies if the liked post is a nested reply
      setNestedReplies(prevNested => {
        const updated = { ...prevNested };
        Object.keys(updated).forEach(parentId => {
          updated[parentId] = updated[parentId].map(reply =>
            reply.id === postId
              ? { ...reply, likes: data.likes || reply.likes }
              : reply
          );
        });
        return updated;
      });
      
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const loadNestedReplies = async (postId) => {
    try {
      const replies = await queryClient.fetchQuery({
        queryKey: ['knowledge', 'forum-post', postId, 'replies'],
        queryFn: async () => {
          const response = await knowledgeForumPostService.getReplies(postId);
          return response?.data || response || [];
        },
        staleTime: 45 * 1000,
        gcTime: 10 * 60 * 1000,
      });
      
      setNestedReplies(prev => ({
        ...prev,
        [postId]: replies
      }));
      
      // Update liked posts with nested replies liked state
      const likedReplyIds = new Set();
      replies.forEach(reply => {
        if (reply.is_liked) {
          likedReplyIds.add(reply.id);
        }
      });
      setLikedPosts(prev => new Set([...prev, ...likedReplyIds]));
      
    } catch (error) {
      console.error('Error loading nested replies:', error);
      toast.error('Failed to load replies');
    }
  };

  const toggleReplies = (postId) => {
    const newExpanded = new Set(expandedReplies);
    if (expandedReplies.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
      // Load nested replies if not already loaded
      if (!nestedReplies[postId]) {
        loadNestedReplies(postId);
      }
    }
    setExpandedReplies(newExpanded);
  };

  const replyUrl = (replyId) => `/knowledge/topics/${slug}/replies/${replyId}`;

  const openReply = (replyId) => {
    navigate(replyUrl(replyId));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen  p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-2/3 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Topic Not Found</h1>
          <p className="text-gray-600 mb-4">The topic you're looking for doesn't exist.</p>
          <Link 
            to={webRoutes.knowledgeForums}
            className="inline-flex items-center text-gold/90 hover:text-gold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forums
          </Link>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(totalPosts / pageSize);

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link to={webRoutes.knowledgeHub} className="hover:text-blue-600">Knowledge Hub</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={webRoutes.knowledgeForums} className="hover:text-blue-600">Forums</Link>
            <ChevronRight className="w-4 h-4" />
            {topic.forum && (
              <>
                <Link 
                  to={webRoutes.knowledgeForumDetail.replace(':slug', topic.forum.slug)}
                  className="hover:text-blue-600"
                >
                  {topic.forum.name}
                </Link>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
            <span className="text-gray-900">{topic.title}</span>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {topic.is_pinned && (
                  <Pin className="w-5 h-5 text-yellow-500" />
                )}
                {topic.status === 'locked' && (
                  <Lock className="w-5 h-5 text-red-500" />
                )}
                <h1 className="text-2xl font-bold text-gray-900">{topic.title}</h1>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>By {topic.author?.first_name} {topic.author?.last_name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(topic.created_at)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{formatNumber(topic.views)} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{formatNumber(topic.replies)} replies</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Flag className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-5 h-5" />
              </button>
              {isCreator && (
                <MoreOptions className="!w-fit">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex items-center gap-2 text-sm text-red-700 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                    </button>
                  </div>
                </MoreOptions>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Topic Content */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {topic.author?.first_name} {topic.author?.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">{formatDate(topic.created_at)}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Original Post
                  </div>
                </div>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{topic.content}</p>
                </div>
                <div className="flex items-center space-x-4 mt-6 pt-4 border-t">
                  <button 
                    onClick={handleLikeTopic}
                    className={`flex items-center space-x-1 transition-colors ${
                      topicLiked 
                        ? 'text-red-600 hover:text-red-700' 
                        : 'text-gray-500 hover:text-blue-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${topicLiked ? 'fill-current' : ''}`} />
                    <span>Like</span>
                    {topicLikes > 0 && <span>({topicLikes})</span>}
                  </button>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600">
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                  <button 
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-blue-600"
                  >
                    <Reply className="w-4 h-4" />
                    <span>Reply</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {postId && (
          <section className="mb-6 rounded-xl border border-light_grey bg-white shadow-sm" aria-labelledby="selected-reply-heading">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-light_grey px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-custom_grey">Reply thread</p>
                <h2 id="selected-reply-heading" className="mt-1 text-lg font-semibold text-dark">
                  Selected conversation
                </h2>
              </div>
              <Link
                to={`/knowledge/topics/${slug}`}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-light_grey px-4 text-sm font-medium text-dark hover:border-gold hover:bg-background"
              >
                <ArrowLeft className="h-4 w-4" />
                All conversations
              </Link>
            </div>

            {threadQuery.isLoading ? (
              <div className="animate-pulse space-y-4 p-5">
                <div className="h-14 rounded-lg bg-gray-100" />
                <div className="h-40 rounded-xl bg-gray-100" />
                <div className="h-20 rounded-lg bg-gray-100" />
              </div>
            ) : threadQuery.isError || !threadQuery.data ? (
              <div className="p-6 text-center">
                <MessageSquare className="mx-auto mb-3 h-10 w-10 text-custom_grey" />
                <p className="font-medium text-dark">This reply is unavailable.</p>
                <p className="mt-1 text-sm text-custom_grey">It may have been removed or you may not have access.</p>
              </div>
            ) : (
              <div className="p-5">
                {threadQuery.data.ancestors?.length > 0 && (
                  <div className="mb-5 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-custom_grey">Conversation context</p>
                    {threadQuery.data.ancestors.map((ancestor) => (
                      <button
                        key={ancestor.id}
                        type="button"
                        onClick={() => openReply(ancestor.id)}
                        className="flex w-full items-start gap-3 rounded-lg border border-light_grey bg-background p-3 text-left hover:border-gold"
                      >
                        <span className="mt-1 h-8 w-1 shrink-0 rounded-full bg-gold" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-dark">
                            {`${ancestor.author?.first_name || ''} ${ancestor.author?.last_name || ''}`.trim() || 'Connectize member'}
                          </span>
                          <span className="mt-1 block truncate text-sm text-custom_grey">{ancestor.content}</span>
                        </span>
                        <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-custom_grey" />
                      </button>
                    ))}
                  </div>
                )}

                <article
                  id={`reply-${threadQuery.data.post.id}`}
                  className="scroll-mt-24 overflow-hidden rounded-xl border border-gold bg-white"
                >
                  <div className="flex">
                    <div className="w-1.5 shrink-0 bg-gold" />
                    <div className="min-w-0 flex-1 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-dark">
                            {`${threadQuery.data.post.author?.first_name || ''} ${threadQuery.data.post.author?.last_name || ''}`.trim() || 'Connectize member'}
                          </h3>
                          <p className="mt-1 text-sm text-custom_grey">{formatDate(threadQuery.data.post.created_at)}</p>
                        </div>
                        <a
                          href={replyUrl(threadQuery.data.post.id)}
                          aria-label="Permanent link to this reply"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-custom_grey hover:bg-background hover:text-dark"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      <p className="mt-4 whitespace-pre-wrap text-dark">{threadQuery.data.post.content}</p>
                      {topic.status !== 'locked' && (
                        <button
                          type="button"
                          onClick={() => handleReplyToPost(threadQuery.data.post)}
                          className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-gold px-4 text-sm font-semibold text-dark hover:bg-custom_yellow"
                        >
                          <Reply className="h-4 w-4" />
                          Reply here
                        </button>
                      )}
                    </div>
                  </div>
                </article>

                <div className="mt-5">
                  <h3 className="mb-3 font-semibold text-dark">
                    Direct responses ({threadQuery.data.post.replies_count || 0})
                  </h3>
                  {threadQuery.data.replies?.length ? (
                    <div className="space-y-2">
                      {threadQuery.data.replies.map((reply) => (
                        <button
                          key={reply.id}
                          type="button"
                          onClick={() => openReply(reply.id)}
                          className="flex w-full items-center gap-3 rounded-lg border border-light_grey p-4 text-left hover:border-gold hover:bg-background"
                        >
                          <MessageSquare className="h-5 w-5 shrink-0 text-gold" />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-dark">
                              {`${reply.author?.first_name || ''} ${reply.author?.last_name || ''}`.trim() || 'Connectize member'}
                            </span>
                            <span className="mt-1 block truncate text-sm text-custom_grey">{reply.content}</span>
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-custom_grey" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-lg bg-background p-4 text-sm text-custom_grey">No direct responses yet.</p>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Reply Form */}
        {showReplyForm && (
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {replyingToPost ? `Reply to ${replyingToPost.author?.first_name || 'User'}` : 'Post a Reply'}
              </h3>
              {replyingToPost && (
                <div className="mb-4 p-3 bg-gray-50 border-l-4 border-blue-500 rounded">
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>{replyingToPost.author?.first_name} {replyingToPost.author?.last_name}</strong> wrote:
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {replyingToPost.content}
                  </p>
                </div>
              )}
              <form onSubmit={handleReplySubmit}>
                <RichTextEditor
                  value={replyContent}
                  onChange={setReplyContent}
                  placeholder="Write your reply here..."
                  minHeight="150px"
                />
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-500">
                    Be respectful and constructive in your response.
                  </p>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowReplyForm(false);
                        setReplyContent('');
                        setReplyingToPost(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReply || !replyContent.trim()}
                      className="px-6 py-2 bg-gold text-dark rounded-lg hover:bg-custom_yellow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingReply ? 'Posting...' : 'Post Reply'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Posts/Replies */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Replies ({formatNumber(totalPosts)})
            </h2>
          </div>
          
          {postsLoading ? (
            <div className="animate-pulse divide-y divide-light_grey" aria-label="Loading conversations">
              {[0, 1, 2].map((item) => (
                <div key={item} className="flex gap-4 p-6">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-1/3 rounded bg-gray-200" />
                    <div className="h-3 w-1/4 rounded bg-gray-100" />
                    <div className="h-4 w-full rounded bg-gray-100" />
                    <div className="h-4 w-4/5 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No replies yet</h3>
              <p className="text-gray-600 mb-4">Be the first to reply to this topic.</p>
              <button
                onClick={() => setShowReplyForm(true)}
                className="inline-flex items-center bg-gold text-dark px-4 py-2 rounded-lg hover:bg-custom_yellow"
              >
                <Reply className="w-4 h-4 mr-2" />
                Post First Reply
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  id={`reply-${post.id}`}
                  className={`scroll-mt-24 p-6 ${postId === String(post.id) ? 'border-l-4 border-gold bg-gold/5' : ''}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {post.author?.first_name} {post.author?.last_name}
                          </h4>
                          <p className="text-sm text-gray-500">{formatDate(post.created_at)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openReply(post.id)}
                          className="inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-sm text-custom_grey hover:bg-background hover:text-dark"
                          aria-label={`Open reply ${index + 1}`}
                        >
                          #{index + 1}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="prose max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                      </div>
                      <div className="flex items-center space-x-4 mt-4">
                        <button 
                          onClick={() => handleLikePost(post.id)}
                          className={`flex items-center space-x-1 text-sm transition-colors ${
                            likedPosts.has(post.id) 
                              ? 'text-red-600 hover:text-red-700' 
                              : 'text-gray-500 hover:text-blue-600'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                          <span>Like</span>
                          {post.likes > 0 && <span>({post.likes})</span>}
                        </button>
                        <button 
                          onClick={() => handleReplyToPost(post)}
                          className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 text-sm"
                        >
                          <Reply className="w-4 h-4" />
                          <span>Reply</span>
                        </button>
                        {post.replies_count > 0 && (
                          <button
                            onClick={() => toggleReplies(post.id)}
                            className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 text-sm"
                          >
                            {expandedReplies.has(post.id) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                            <span>{post.replies_count} {post.replies_count === 1 ? 'reply' : 'replies'}</span>
                          </button>
                        )}
                        <button className="flex items-center space-x-1 text-gray-500 hover:text-red-600 text-sm">
                          <Flag className="w-4 h-4" />
                          <span>Report</span>
                        </button>
                      </div>
                      
                      {/* Nested Replies */}
                      {expandedReplies.has(post.id) && nestedReplies[post.id] && (
                        <div className="mt-4 ml-6 border-l-2 border-gray-200 pl-6 space-y-4">
                          {nestedReplies[post.id].map((reply) => (
                            <div
                              key={reply.id}
                              id={`reply-${reply.id}`}
                              className={`scroll-mt-24 rounded-lg border p-4 ${postId === String(reply.id) ? 'border-gold bg-gold/5' : 'border-transparent bg-background'}`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-gray-600" />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="mb-2 flex items-center gap-2">
                                    <h5 className="text-sm font-medium text-gray-900">
                                      {reply.author?.first_name} {reply.author?.last_name}
                                    </h5>
                                    <span className="text-xs text-gray-500">{formatDate(reply.created_at)}</span>
                                    <button
                                      type="button"
                                      onClick={() => openReply(reply.id)}
                                      className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full text-custom_grey hover:bg-white hover:text-dark"
                                      aria-label="Open reply thread"
                                    >
                                      <ExternalLink className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                                  <div className="flex items-center space-x-3 mt-2">
                                    <button 
                                      onClick={() => handleLikePost(reply.id)}
                                      className={`flex items-center space-x-1 text-xs transition-colors ${
                                        likedPosts.has(reply.id)
                                          ? 'text-red-600 hover:text-red-700'
                                          : 'text-gray-400 hover:text-blue-600'
                                      }`}
                                    >
                                      <Heart className={`w-3 h-3 ${likedPosts.has(reply.id) ? 'fill-current' : ''}`} />
                                      <span>Like</span>
                                      {reply.likes > 0 && <span>({reply.likes})</span>}
                                    </button>
                                    <button 
                                      onClick={() => handleReplyToPost(reply)}
                                      className="flex items-center space-x-1 text-gray-400 hover:text-blue-600 text-xs"
                                    >
                                      <Reply className="w-3 h-3" />
                                      <span>Reply</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalPosts)} of {totalPosts} replies
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum = Math.max(1, currentPage - 2) + i;
                      if (pageNum > totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 text-sm rounded ${
                            pageNum === currentPage
                              ? 'bg-gold text-dark'
                              : 'border border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Reply Button */}
        {!showReplyForm && topic.status !== 'locked' && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowReplyForm(true)}
              className="inline-flex items-center bg-gold text-dark px-6 py-3 rounded-lg hover:bg-custom_yellow"
            >
              <Reply className="w-5 h-5 mr-2" />
              Reply to Topic
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeTopicDetail;
