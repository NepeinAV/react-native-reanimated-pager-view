import type { DemoId } from './catalog/demos';
import type { Post } from './types';

export type RootStackParamList = {
  Catalog: undefined;
  Demo: { id: DemoId };
  Showcase: undefined;
  PostDetail: {
    post: Post;
    allPosts: Post[];
  };
};
