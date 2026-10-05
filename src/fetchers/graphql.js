// Katman 1 (gönderi) ve 3 (profil): ?__a=1&__d=dis JSON endpoint'i.
import { viaProxy } from './proxyPool.js';

const best = (a) => [...a].sort((x, y) => (y.width || 0) - (x.width || 0))[0];

// Hem yeni (items/api v1) hem eski (graphql) JSON şemasını düz listeye çevirir.
function fromNode(n) {
  if (n.carousel_media) return n.carousel_media.flatMap(fromNode);
  if (n.edge_sidecar_to_children) return n.edge_sidecar_to_children.edges.flatMap((e) => fromNode(e.node));
  if (n.video_versions?.length) {
    const v = best(n.video_versions);
    return [{ type: 'video', url: v.url, width: v.width, height: v.height }];
  }
  if (n.image_versions2?.candidates?.length) {
    const i = best(n.image_versions2.candidates);
    return [{ type: 'image', url: i.url, width: i.width, height: i.height }];
  }
  const d = n.dimensions || {};
  if (n.is_video && n.video_url) return [{ type: 'video', url: n.video_url, width: d.width, height: d.height }];
  if (n.display_url) return [{ type: 'image', url: n.display_url, width: d.width, height: d.height }];
  return [];
}

export async function graphqlPost(sc) {
  const j = JSON.parse(await viaProxy(`https://www.instagram.com/p/${sc}/?__a=1&__d=dis`));
  const node = j.items?.[0] || j.graphql?.shortcode_media || j.data?.xdt_shortcode_media;
  return node ? fromNode(node) : [];
}

export async function graphqlProfile(user) {
  const j = JSON.parse(await viaProxy(`https://www.instagram.com/${user}/?__a=1&__d=dis`));
  const u = j.graphql?.user || j.data?.user;
  const edges = u?.edge_owner_to_timeline_media?.edges || [];
  return edges.slice(0, 12).flatMap((e) => fromNode(e.node));
}
