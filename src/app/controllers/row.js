define([
  'angular',
  'app',
  'underscore'
],
function (angular, app, _) {
  'use strict';

  var module = angular.module('grafana.controllers');

  module.controller('RowCtrl', function($scope, $rootScope, $timeout) {
    var _d = {
      title: "Row",
      height: "150px",
      collapse: false,
      editable: true,
      panels: [],
    };

    _.defaults($scope.row,_d);

    $scope.init = function() {
      $scope.reset_panel();
    };

    $scope.toggle_row = function(row) {
      row.collapse = row.collapse ? false : true;
      if (!row.collapse) {
        $timeout(function() {
          $scope.$broadcast('render');
        });
      }
    };

    $scope.rowSpan = function(row) {
      var panels = _.filter(row.panels, function(p) {
        return $scope.isPanel(p);
      });
      return _.reduce(_.pluck(panels,'span'), function(p,v) {
        return p+v;
      },0);
    };

    // This can be overridden by individual panels
    $scope.close_edit = function() {
      $scope.$broadcast('render');
    };

    $scope.add_panel = function(panel) {
      var rowSpan = $scope.rowSpan($scope.row);
      var panelCount = $scope.row.panels.length;
      var space = (12 - rowSpan) - panel.span;

      // try to make room of there is no space left
      if (space <= 0) {
        if (panelCount === 1) {
          $scope.row.panels[0].span = 6;
          panel.span = 6;
        }
        else if (panelCount === 2) {
          $scope.row.panels[0].span = 4;
          $scope.row.panels[1].span = 4;
          panel.span = 4;
        }
      }

      $scope.row.panels.push(panel);
    };

    $scope.delete_row = function() {
      if (confirm("Are you sure you want to delete this row?")) {
        $scope.dashboard.rows = _.without($scope.dashboard.rows, $scope.row);
      }
    };

    $scope.move_row = function(direction) {
      var rowsList = $scope.dashboard.rows;
      var rowIndex = _.indexOf(rowsList, $scope.row);
      var newIndex = rowIndex + direction;
      if (newIndex >= 0 && newIndex <= (rowsList.length - 1)) {
        _.move(rowsList, rowIndex, rowIndex + direction);
      }
    };

    $scope.add_panel_default = function(type) {
      $scope.reset_panel(type);
      $scope.add_panel($scope.panel);

      $timeout(function() {
        $scope.$broadcast('render');
      });
    };

    $scope.set_height = function(height) {
      $scope.row.height = height;
      $scope.$broadcast('render');
    };

    $scope.remove_panel_from_row = function(row, panel) {
      if (confirm('Are you sure you want to remove this ' + panel.type + ' panel?')) {
        row.panels = _.without(row.panels,panel);
      }
    };

    $scope.duplicatePanel = function(panel, row) {
      row = row || $scope.row;
      var currentRowSpan = $scope.rowSpan(row);
      if (currentRowSpan <= 9) {
        row.panels.push(angular.copy(panel));
      }
      else {
        var rowsList = $scope.dashboard.rows;
        var rowIndex = _.indexOf(rowsList, row);
        if (rowIndex === rowsList.length - 1) {
          var newRow = angular.copy($scope.row);
          newRow.panels = [];
          $scope.dashboard.rows.push(newRow);
          $scope.duplicatePanel(panel, newRow);
        }
        else {
          $scope.duplicatePanel(panel, rowsList[rowIndex+1]);
        }
      }
    };

    $scope.reset_panel = function(type) {
      var
        defaultSpan = 12,
        _as = 12-$scope.rowSpan($scope.row);

      $scope.panel = {
        error   : false,
        /** @scratch /panels/1
         * span:: A number, 1-12, that describes the width of the panel.
         */
        span    : _as < defaultSpan && _as > 0 ? _as : defaultSpan,
        /** @scratch /panels/1
         * editable:: Enable or disable the edit button the the panel
         */
        editable: true,
        /** @scratch /panels/1
         * type:: The type of panel this object contains. Each panel type will require additional
         * properties. See the panel types list to the right.
         */
        type    : type
      };

      function fixRowHeight(height) {
        if (!height) {
          return '200px';
        }
        if (!_.isString(height)) {
          return height + 'px';
        }
        return height;
      }

      $scope.row.height = fixRowHeight($scope.row.height);
    };

    /** @scratch /panels/2
     * --
     */

    $scope.init();

  });

});
