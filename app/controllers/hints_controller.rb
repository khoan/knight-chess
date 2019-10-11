class HintsController < ApplicationController
  KnightMoves = Struct.new(:current_pos, :target_pos) do
    def moves
      @all_pos = []
      @branches = []

      # hypothesis: knight can get to any tiles in 64 moves
      64.times do
        branch! if can_branch?
        return @the_moves if @the_moves
      end

      []
    end

    def can_branch?
      @branches.empty? || @branches.any?{|branch| ! branch.include?(:done)}
    end

    def branch!
      return next_moves_from(current_pos).each{|pos|
        @all_pos << pos
        @branches.push [pos]
        @the_moves = @branches.last if pos == target_pos
      } if @branches.empty?

      new_branches = []

      @branches.each do |branch|
        new_moves = next_moves_from(branch.last).select{|pos|
          !@all_pos.include?(pos) && !branch.include?(pos)
        }

        if new_moves.empty?
          branch.push :done
        else
          new_moves.each do |pos|
            @all_pos << pos
            new_branches << branch.compact.push(pos)
            @the_moves = new_branches.last if pos == target_pos
          end
        end
      end

      @branches = @branches.concat(new_branches)
    end

    def next_moves_from pos
      return [] if pos == :done

      xy = to_xy(pos)

      possibilities = [
        {x: xy[:x] - 2, y: xy[:y] + 1},
        {x: xy[:x] - 2, y: xy[:y] - 1},
        {x: xy[:x] + 2, y: xy[:y] + 1},
        {x: xy[:x] + 2, y: xy[:y] - 1},

        {x: xy[:x] + 1, y: xy[:y] + 2},
        {x: xy[:x] - 1, y: xy[:y] + 2},
        {x: xy[:x] + 1, y: xy[:y] - 2},
        {x: xy[:x] - 1, y: xy[:y] - 2}
      ];

      possibilities.select{|xy|
        -1 < xy[:x] && xy[:x] < 8 &&
          -1 < xy[:y] && xy[:y] < 8
      }.map{|xy| to_i xy}
    end

    # convert tile index into cartesian coordinate
    def to_xy i
      {
        x: i / 8,
        y: i % 8
      }
    end

    # convert cartesian coordinate into square number
    def to_i xy
      xy[:x] * 8 + xy[:y]
    end
  end

  def index
    render json: KnightMoves.new(params[:currentPos].to_i, params[:targetPos].to_i).moves
  end
end
