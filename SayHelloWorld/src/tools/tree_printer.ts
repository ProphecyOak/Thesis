export function getPrintableTree<T>(
  tree: T,
  fx: (x: T) => {
    label: string;
    children: T[];
  },
  nesty = ""
): string {
  const indentAmount = "  ";
  const thisNode = fx(tree);
  return `${thisNode.label}\n${thisNode.children.reduce(
    (acc: string, child: T, i: number) => {
      const lastChild = i == thisNode.children.length - 1;
      return (
        acc +
        `${nesty}${
          lastChild ? `${indentAmount}└─` : `${indentAmount}├─`
        }${getPrintableTree(
          child,
          fx,
          nesty + (lastChild ? `${indentAmount}` : `${indentAmount}│`)
        )}`
      );
    },
    ""
  )}`;
}

// const myTree = {
//   label: "root",
//   children: [
//     {
//       label: "child1",
//       children: [
//         {
//           label: "child1-1",
//           children: [{ label: "child1-1-1", children: [] }],
//         },
//         { label: "child1-2", children: [] },
//         { label: "child1-3", children: [] },
//       ],
//     },
//     {
//       label: "child2",
//       children: [
//         {
//           label: "child2-1",
//           children: [{ label: "child2-1-1", children: [] }],
//         },
//       ],
//     },
//   ],
// };

// console.log(getPrintableTree(myTree, (x) => x));
