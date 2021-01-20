const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);
let id1 = "";
let id2 = "";

suite('Functional Tests', function() {

  suite('POST /api/issues/{project}', function() {

    test("Create an issue with every field", function(done) {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          issue_title: "Title",
          issue_text: "text",
          created_by: "Functional Test - Every field filled in",
          assigned_to: "Chai and Mocha",
          status_text: "In QA"
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Title");
          assert.equal(res.body.issue_text, "text");
          assert.equal(
            res.body.created_by,
            "Functional Test - Every field filled in"
          );
          assert.equal(res.body.assigned_to, "Chai and Mocha");
          assert.equal(res.body.status_text, "In QA");
          assert.equal(res.body.project, "test");
          id1 = res.body._id;
          // console.log("id 1 has been set as " + id1);
          done();
        });
    });

    test("Create an issue with only required fields", function(done) {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          issue_title: "Title 2",
          issue_text: "text",
          created_by: "Functional Test - Every field filled in"
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Title 2");
          assert.equal(res.body.issue_text, "text");
          assert.equal(
            res.body.created_by,
            "Functional Test - Every field filled in"
          );
          assert.equal(res.body.assigned_to, "");
          assert.equal(res.body.status_text, "");
          assert.equal(res.body.project, "test");
          id2 = res.body._id;
          // console.log("id 2 has been set as " + id2);
          done();
        })
    });

    test("Create an issue with missing required fields", function(done) {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          issue_title: "Title"
        })
        .end(function(err, res) {
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });
  })

  suite(
    "GET /api/issues/{project} => Array of objects with issue data",
    function() {
      test("View issues on a project", function(done) {
        chai
          .request(server)
          .get("/api/issues/test")
          .query({})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], "issue_title");
            assert.property(res.body[0], "issue_text");
            assert.property(res.body[0], "created_on");
            assert.property(res.body[0], "updated_on");
            assert.property(res.body[0], "created_by");
            assert.property(res.body[0], "assigned_to");
            assert.property(res.body[0], "open");
            assert.property(res.body[0], "status_text");
            assert.property(res.body[0], "_id");
            done();
          });
      });

      test("View issues on a project with one filter", function(done) {
        chai
          .request(server)
          .get("/api/issues/test")
          .query({ created_by: "Functional Test - Every field filled in" })
          .end(function(err, res) {
            res.body.forEach(issueResult => {
              assert.equal(
                issueResult.created_by,
                "Functional Test - Every field filled in"
              );
            });
            done();
          });
      });

      test("View issues on a project with multiple filters", function(done) {
        chai
          .request(server)
          .get("/api/issues/test")
          .query({
            open: true,
            created_by: "Functional Test - Every field filled in"
          })
          .end(function(err, res) {
            res.body.forEach(issueResult => {
              assert.equal(issueResult.open, true);
              assert.equal(
                issueResult.created_by,
                "Functional Test - Every field filled in"
              );
            });
            done();
          });
      });
    }
  );

  suite("PUT /api/issues/{project} => text", function() {

    test('Update one field on an issue', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: id1,
          issue_title: 'Updated Title'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body.result, 'successfully updated');
          assert.deepEqual(res.body._id, id1);
          done();
        });
    });

    test("Update multiple fields on an issue", function(done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          _id: id2,
          issue_title: "new title",
          issue_text: "new text"
        })
        .end(function(err, res) {
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, id2)
          done();
        });
    });

    test('Update an issue with missing', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          issue_title: 'Updated Title',
          issue_text: 'updated issue text'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });

     test('Update an issue with no fields to update', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: id1
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'no update field(s) sent');
          assert.equal(res.body._id, id1);
          done();
        });
    });

    test('Update an issue with an invalid _id', function(done) {
      const badId = "5f665eb46e296f6b9b6a504d";
      chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: badId,
          issue_title: 'Updated Title',
          issue_text: 'updated issue text'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not update');
          done();
        });
    });
  });

  suite("DELETE /api/issues/{project} => text", function() {

    test('Delete an issue', function(done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({
          _id: id1
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully deleted');
          assert.equal(res.body._id, id1);
          // done();
        });
      chai.request(server)
        .delete('/api/issues/test')
        .send({
          _id: id2
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully deleted');
          assert.equal(res.body._id, id2);
          done();
        });
    });

    test('Delete an issue with an invalid _id', function(done) {
      const badId = "5f665eb46e296f6b9b6a504d";
      chai.request(server)
        .delete('/api/issues/test')
        .send({
          _id: badId
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not delete');
          assert.equal(res.body._id, badId);
          done();
        });
    });

    test('Delete an issue with missing _id', function(done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({
        })
        .end(function(err, res) {
          assert.equal(res.body.error, 'missing _id')
          done()
        });
    });

  });
});
