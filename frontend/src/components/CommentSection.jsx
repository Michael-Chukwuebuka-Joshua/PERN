import { useState } from "react";
import { useAuth, SignInButton } from "@clerk/react";
import {
  useCreateComment,
  useDeleteComment,
  useEditComment,
} from "../hooks/useComments";
import {
  SendIcon,
  Trash2Icon,
  MessageSquareIcon,
  LogInIcon,
  EditIcon,
  CheckIcon,
  XIcon,
} from "lucide-react";

function CommentSection({ productId, comments = [], currentUserId }) {
  const { isSignedIn } = useAuth();
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment(productId);
  const editComment = useEditComment(productId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    createComment.mutate(
      { productId, content },
      { onSuccess: () => setContent("") },
    );
  };

  const startEditing = (comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    editComment.mutate(
      { commentId: editingId, content: editContent },
      { onSuccess: () => cancelEditing() },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquareIcon className="size-5 text-primary" />
        <h3 className="font-bold">Comments</h3>
        <span className="badge badge-neutral badge-sm">{comments.length}</span>
      </div>
      {isSignedIn ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Add a comment..."
            className="input input-bordered input-sm flex-1 bg-base-200"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={createComment.isPending}
          />

          <button
            type="submit"
            className="btn btn-primary btn-sm btn-square"
            disabled={createComment.isPending || !content.trim()}
          >
            {createComment.isPending ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <SendIcon className="size-4" />
            )}
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between bg-base-200 rounded-lg p-3">
          <span className="text-sm text-base-content/60">
            Sign in to join the conversation
          </span>
          <SignInButton mode="modal">
            <button className="btn btn-primary btn-sm gap-1">
              <LogInIcon className="size-4" />
              Sign In
            </button>
          </SignInButton>
        </div>
      )}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-base-content/50">
            <MessageSquareIcon className="size-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No comments yet. Be the first!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="chat chat-start">
              <div className="chat-image avatar">
                <div className="rounded-full w-8">
                  <img src={comment.user?.imageUrl} alt={comment.user?.name} />
                </div>
              </div>

              <div className="chat-header text-xs opacity-70 mb-2">
                {comment.user?.name}
                <time className="ml-2 text-xs opacity-50">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </time>
                {comment.updatedAt !== comment.createdAt && (
                  <span className="ml-1 text-xs italic">(edited)</span>
                )}
              </div>

              {editingId === comment.id ? (
                <form onSubmit={handleEditSubmit} className="flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered input-sm flex-1 bg-base-200"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    disabled={editComment.isPending}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm btn-square"
                    disabled={editComment.isPending || !editContent.trim()}
                  >
                    {editComment.isPending ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      <CheckIcon className="size-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="btn btn-ghost btn-sm btn-square"
                    disabled={editComment.isPending}
                  >
                    <XIcon className="size-4" />
                  </button>
                </form>
              ) : (
                <div className="chat-bubble chat-bubble-neutral text-sm">
                  {comment.content}
                </div>
              )}

              {currentUserId === comment.userId &&
                (() => {
                  const isDeleting =
                    deleteComment.isPending &&
                    deleteComment.variables?.commentId === comment.id;
                  return (
                    <div className="chat-footer">
                      <button
                        onClick={() => startEditing(comment)}
                        className="btn btn-ghost btn-xs text-info"
                        disabled={isDeleting}
                      >
                        <EditIcon className="size-3" />
                      </button>
                      <button
                        onClick={() =>
                          confirm("Delete?") &&
                          deleteComment.mutate({ commentId: comment.id })
                        }
                        className="btn btn-ghost btn-xs text-error"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <span className="loading loading-spinner loading-xs" />
                        ) : (
                          <Trash2Icon className="size-3" />
                        )}
                      </button>
                    </div>
                  );
                })()}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CommentSection;
