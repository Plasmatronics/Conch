# Caching

A 100-conch capacity LRU cache can be found in `ConchFamilyCache` to avoid redundant traversals of the `Relationships` table through the algorithms implemented in `ConchFamilyGraph`.

## Motivation

Familial Relationships are needed in any given Conch for every single member (or at least user) to every other member (or, again, at least user). This is because many pages document the exact relationship the current signed in user has to every documented member in the Conch, dervied through traversing the `Relationship` table.

Algorithmically, this traversal process runs in the maginute of O(N³) per Conch. To process this for every necessary request (any page involving member(s) UI), we would be consistently recomputing the same relationships.
With a caching strategy, we can asymptotically bring famillial relationships down to O(N) for retrieving all relationships of a given member and O(1) for retrieving any one relationship for all users traversing a given Conch.

## Building Strategy

We build the cache once upon a request for a conche's request for familial relationships, then cache the results in a LRU Cache, `ConchFamilyCache`, in the application layer, mounted along with the app itself upon startup.

## Invalidation Strategy

To avoid memory bloat we only hold 100 conch familial relationships at a time, evicting according to least-recency. We also must invalidate/rebuild a conch whenver one of the following criteria is met:

1. Relationship Deletion
2. Relationship Modification
3. Relationship Creation
4. Member Creation
5. Member Deletion

This is because meeting the above criteria incurs the risk of familial relationships now being incorrect/stale.
This invalidation should not present too much of a problem considering we expect a lot of invalidation upfront writes (a lot of upfront member additions), and then a conch will likely move towards primarily a read access pattern.

## Future Improvements

We should maintain capacity according to relationship pairs held to have a more precise dial on the amount of memory we're holding, rather than holding whatever 100 conches come our way.
This would be something in the form of weighing caches by the amount of pairs they hold.

Additionally, we will need to look for external cache stores like Memcache or Redis if the following criteria is ever met:

1. We have to shard servers. This would necessarily mean we no longer hold the ability to have a cache in the application layer effectively since we will then have many instances of the application running concurrently.
2. We are processing so much familial data that we have abundant amount of cache misses due to constant LRU eviction, or for any other reason. This would then defeat the purpose of the Cache in the first place and we would have to look for an external cache store as an alternative to better suit the purposes of our Cache.
