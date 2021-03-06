class ProxyExercisesController < ApplicationController
  include CommonBehavior

  before_action :set_exercise_and_authorize, only: MEMBER_ACTIONS + [:clone, :reload]

  def authorize!
    authorize(@proxy_exercise || @proxy_exercises)
  end
  private :authorize!

  def clone
    proxy_exercise = @proxy_exercise.duplicate(public: false, token: nil, exercises: @proxy_exercise.exercises, user: current_user)
    proxy_exercise.send(:generate_token)
    if proxy_exercise.save
      redirect_to(proxy_exercise, notice: t('shared.object_cloned', model:  ProxyExercise.model_name.human))
    else
      flash[:danger] = t('shared.message_failure')
      redirect_to(@proxy_exercise)
    end
  end

  def create
    myparams = proxy_exercise_params
    myparams[:exercises] = Exercise.find(myparams[:exercise_ids].reject { |c| c.empty? })
    @proxy_exercise = ProxyExercise.new(myparams)
    authorize!

    create_and_respond(object: @proxy_exercise)
  end

  def destroy
    destroy_and_respond(object: @proxy_exercise)
  end

  def edit
    @search = policy_scope(Exercise).ransack(params[:q])
    @exercises = @search.result.order(:title)
    authorize!
  end

  def proxy_exercise_params
    params[:proxy_exercise].permit(:description, :title, :public, :exercise_ids  => []).merge(user_id: current_user.id, user_type: current_user.class.name) if params[:proxy_exercise].present?
  end
  private :proxy_exercise_params

  def index
    @search = policy_scope(ProxyExercise).ransack(params[:q])
    @proxy_exercises = @search.result.order(:title).paginate(page: params[:page])
    authorize!
  end

  def new
    @proxy_exercise =  ProxyExercise.new
    @search = policy_scope(Exercise).ransack(params[:q])
    @exercises = @search.result.order(:title)
    authorize!
  end

  def set_exercise_and_authorize
    @proxy_exercise = ProxyExercise.find(params[:id])
    authorize!
  end
  private :set_exercise_and_authorize

  def show
    @search = @proxy_exercise.exercises.ransack
    @exercises = @proxy_exercise.exercises.ransack.result.order(:title) #@search.result.order(:title)
  end

  #we might want to think about auth here
  def reload
  end

  def update
    myparams = proxy_exercise_params
    myparams[:exercises] = Exercise.find(myparams[:exercise_ids].reject { |c| c.blank? })
    update_and_respond(object: @proxy_exercise, params: myparams)
  end

end
