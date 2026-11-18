/**
 * Install shell for the local dsh-magpie-lifecycle plugin.
 *
 * The plugin itself stays where it was written — D:\software\DSH\Extension\
 * magpie-lifecycle — and is loaded from there through a file: URL, so there is
 * exactly one copy of the code. Edit that copy and restart DSH to pick up the
 * change; this file does not need to change.
 *
 * A profile-installed bundle is linked, not packed, so a "file:" package
 * dependency in package.json would not be installed and the row could not
 * resolve the bare specifier `dsh-magpie-lifecycle`.
 */
export * from 'file:///D:/software/DSH/Extension/magpie-lifecycle/index.js'
