import { enumerateExpressions, filterExpressions } from '../EnumerateExpressions';
// import { makeTestProject } from '../../fixtures/TestProject';
// const gd = global.gd;

describe('EnumerateObjects', () => {
//   const { project, testLayout } = makeTestProject(gd);

  it('can enumerate and filter expressions', () => {
    const {
      freeExpressions,
      objectsExpressions,
    } = enumerateExpressions('number');

    // Should find atan, atan2, atanh math function
    expect(filterExpressions(freeExpressions, 'atan')).toHaveLength(3);

    // Should find abs math function
    expect(filterExpressions(freeExpressions, 'abs')).toHaveLength(1);

    expect(filterExpressions(freeExpressions, 'MouseX')).toHaveLength(1);
    expect(filterExpressions(freeExpressions, 'MouseY')).toHaveLength(1);

    expect(filterExpressions(objectsExpressions, 'PointX')).toHaveLength(1);
  });
});
